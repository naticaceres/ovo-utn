import { api } from '../context/api';

export interface DownloadParams {
  url: string;
  params?: Record<string, unknown>;
  filename: string;
  token?: string;
  expectedContentType?: string;
}

export async function downloadFile({
  url,
  params,
  filename,
  token,
  expectedContentType,
}: DownloadParams): Promise<void> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await api.get(url, {
      params,
      headers,
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    if (!blob || blob.size === 0) {
      throw new Error('Archivo vacío');
    }
    const contentType =
      (response.headers && response.headers['content-type']) || '';
    if (expectedContentType && !contentType.startsWith(expectedContentType)) {
      const text = await blob.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* ignore parse */
      }
      const extracted =
        (parsed && typeof parsed === 'object' && 'message' in parsed
          ? (parsed as { message?: string }).message
          : undefined) ??
        (parsed && typeof parsed === 'object' && 'error' in parsed
          ? (parsed as { error?: string }).error
          : undefined) ??
        text ??
        'Tipo de contenido inesperado';
      const msg: string = extracted;
      throw new Error(msg);
    }
    // Intentar extraer filename del header Content-Disposition si viene del backend
    const cd = response.headers && response.headers['content-disposition'];
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
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err: unknown) {
    // Intentar extraer mensaje de blob de error
    const axiosResp = (err as { response?: { data?: unknown } })?.response;
    const data = axiosResp?.data;
    if (data instanceof Blob) {
      const text = await data.text();
      let parsed: { message?: string; error?: string } | undefined;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* ignore parse */
      }
      const message =
        parsed?.message ||
        parsed?.error ||
        text ||
        (err as Error)?.message ||
        'Error de descarga';
      throw new Error(message);
    }
    throw err;
  }
}
