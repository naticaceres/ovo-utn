import { api } from '../context/api';

export interface DownloadParams {
  url: string;
  params?: Record<string, unknown>;
  filename: string;
  token?: string;
  expectedContentType?: string;
}

export async function downloadCsvDirect({
  url,
  params,
  filename,
  token,
}: Omit<DownloadParams, 'expectedContentType'>): Promise<void> {
  // For CSV, try direct download first (no blob conversion)
  try {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const fullUrl = `${api.defaults.baseURL}${url}${queryString ? `?${queryString}` : ''}`;

    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.style.display = 'none';

    // Add auth header via a temporary form if needed
    if (token) {
      // Fallback to blob method for authenticated requests
      return downloadFile({
        url,
        params,
        filename,
        token,
        expectedContentType: 'text/csv',
      });
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.warn(
      'Direct CSV download failed, falling back to blob method:',
      error
    );
    // Fallback to blob method
    return downloadFile({
      url,
      params,
      filename,
      token,
      expectedContentType: 'text/csv',
    });
  }
}

export async function downloadFile({
  url,
  params,
  filename,
  token,
  expectedContentType,
}: DownloadParams): Promise<void> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Determine if this is a CSV file
  const isCSV =
    filename.toLowerCase().endsWith('.csv') ||
    expectedContentType?.includes('csv');

  try {
    const response = await api.get(url, {
      params,
      headers,
      responseType: isCSV ? 'text' : 'blob',
    });

    if (isCSV) {
      // Handle CSV as text response
      const csvData = response.data as string;
      const contentType = response.headers?.['content-type'] || '';

      // Check if response is actually an error JSON
      if (contentType.includes('application/json')) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(csvData);
          const errorMessage =
            (parsed && typeof parsed === 'object' && 'message' in parsed
              ? (parsed as { message?: string }).message
              : undefined) ??
            (parsed && typeof parsed === 'object' && 'error' in parsed
              ? (parsed as { error?: string }).error
              : undefined) ??
            'Error en la descarga';
          throw new Error(errorMessage);
        } catch {
          // If not valid JSON, continue with CSV processing
        }
      }

      if (!csvData || csvData.trim().length === 0) {
        throw new Error('Archivo CSV vacío');
      }

      // Create CSV blob and download
      const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const objectUrl = URL.createObjectURL(csvBlob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }, 100);
    } else {
      // Handle PDF/other files as blob response
      const blob = response.data as Blob;
      if (!blob || !(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Archivo vacío o respuesta inválida');
      }

      const contentType = response.headers?.['content-type'] || blob.type || '';

      // Check if response is actually an error (JSON) disguised as a blob
      if (contentType.includes('application/json')) {
        const text = await blob.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
          const errorMessage =
            (parsed && typeof parsed === 'object' && 'message' in parsed
              ? (parsed as { message?: string }).message
              : undefined) ??
            (parsed && typeof parsed === 'object' && 'error' in parsed
              ? (parsed as { error?: string }).error
              : undefined) ??
            'Error en la descarga';
          throw new Error(errorMessage);
        } catch {
          throw new Error(text || 'Error del servidor');
        }
      }

      // For PDF files, ensure proper content type
      if (
        filename.toLowerCase().endsWith('.pdf') &&
        !contentType.includes('pdf')
      ) {
        console.warn('PDF file without proper content-type, proceeding anyway');
      }

      // Content type validation (if specified)
      if (expectedContentType && !contentType.startsWith(expectedContentType)) {
        console.warn(`Expected ${expectedContentType} but got ${contentType}`);
      }

      // Extract filename from Content-Disposition header if available
      const cd = response.headers?.['content-disposition'];
      let finalFilename = filename;
      if (cd && typeof cd === 'string') {
        const match = cd.match(
          /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i
        );
        const rawName = match
          ? decodeURIComponent(match[1] || match[2] || '').trim()
          : '';
        if (rawName) {
          finalFilename = rawName.replace(/[/\\]/g, '_');
        }
      }

      // Create download link
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = finalFilename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }, 100);
    }
  } catch (err: unknown) {
    console.error('Download error:', err);

    // Handle axios response errors with blob data
    const axiosError = err as {
      response?: { data?: unknown; status?: number; statusText?: string };
    };
    const response = axiosError?.response;

    if (response?.data instanceof Blob) {
      try {
        const text = await response.data.text();
        let parsed: { message?: string; error?: string } | undefined;
        try {
          parsed = JSON.parse(text);
        } catch {
          // Not JSON, use text as error message
        }

        const message =
          parsed?.message ||
          parsed?.error ||
          text ||
          `Error ${response.status}: ${response.statusText}` ||
          'Error de descarga';
        throw new Error(message);
      } catch (blobError) {
        console.error('Error reading blob error response:', blobError);
        throw new Error(`Error de descarga (${response.status})`);
      }
    }

    // Handle other error types
    if (err instanceof Error) {
      throw err;
    }

    throw new Error('Error desconocido en la descarga');
  }
}
