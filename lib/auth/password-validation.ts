export interface PasswordValidation {
  hasMinLen: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  isPasswordValid: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  const hasMinLen = password.length >= 8 && password.length <= 15;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return {
    hasMinLen,
    hasUpper,
    hasLower,
    hasNumber,
    isPasswordValid: hasMinLen && hasUpper && hasLower && hasNumber,
  };
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return confirmPassword.length > 0 && password === confirmPassword;
}