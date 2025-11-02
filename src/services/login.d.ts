export interface LoginResponse {
  data?: unknown;
  usuario?: unknown;
  user?: unknown;
  headers?: Record<string, string>;
}

export interface ForgotPasswordResponse {
  data?: unknown;
  message?: string;
}

export function login(
  correo: string,
  contrasena: string
): Promise<LoginResponse>;

export function forgotPassword(correo: string): Promise<ForgotPasswordResponse>;
