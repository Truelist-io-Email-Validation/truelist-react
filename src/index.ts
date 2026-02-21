// Provider
export { TruelistProvider, useTruelistConfig } from "./provider";
export type { TruelistProviderProps } from "./provider";

// Hook
export { useEmailValidation } from "./use-email-validation";
export type {
  UseEmailValidationOptions,
  UseEmailValidationReturn,
} from "./use-email-validation";

// Component
export { EmailInput } from "./email-input";
export type { EmailInputProps, ValidateOn } from "./email-input";

// Client
export { verifyEmail, getAccount, TruelistApiError } from "./client";

// Types
export type {
  ValidationState,
  ValidationSubState,
  ValidationResult,
  TruelistConfig,
  ApiResponse,
  ApiEmailRecord,
} from "./types";
