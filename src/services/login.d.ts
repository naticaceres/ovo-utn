export interface LoginResponse {
  data?: unknown;
  usuario?: unknown;
  user?: unknown;
  headers?: Record<string, string>;
}

export function login(
  correo: string,
  contrasena: string
): Promise<LoginResponse>;
