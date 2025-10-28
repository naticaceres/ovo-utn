export interface RegisterPayload {
  nombre: string;
  correo: string;
  contrasena: string;
  aceptaPoliticas?: boolean;
}

export function register(payload: RegisterPayload): Promise<unknown>;
export function loginGoogle(token: string): Promise<unknown>;
export function me(): Promise<unknown>;
export function registerGoogle(payload: unknown): Promise<unknown>;
export function deactivate(token?: string): Promise<unknown>;
export function forgotPassword(email: string): Promise<unknown>;
export function validatePasswordToken(token: string): Promise<unknown>;
export function resetPassword(payload: unknown): Promise<unknown>;
export function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<unknown>;
