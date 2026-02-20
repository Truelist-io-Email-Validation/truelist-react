/** Primary validation state returned by the Truelist API. */
export type ValidationState = "valid" | "invalid" | "risky" | "unknown";

/** Detailed sub-state providing more context about the validation result. */
export type ValidationSubState =
  | "ok"
  | "accept_all"
  | "disposable_address"
  | "role_address"
  | "failed_mx_check"
  | "failed_spam_trap"
  | "failed_no_mailbox"
  | "failed_greylisted"
  | "failed_syntax_check"
  | "unknown";

/** The result object returned after validating an email address. */
export type ValidationResult = {
  /** The primary validation state. */
  state: ValidationState;
  /** Detailed sub-state for the validation result. */
  subState: ValidationSubState;
  /** The email address that was validated. */
  email: string;
  /** A suggested correction if a typo was detected (e.g. "Did you mean gmail.com?"). */
  suggestion?: string;
  /** Whether the email belongs to a free email provider. */
  freeEmail?: boolean;
  /** Whether the email is a role-based address (e.g. info@, support@). */
  role?: boolean;
};

/** Configuration for the Truelist provider and API client. */
export type TruelistConfig = {
  /** Your Truelist form API key. */
  apiKey: string;
  /** Base URL for the Truelist API. Defaults to `https://api.truelist.io`. */
  baseUrl?: string;
};

/** Raw API response shape from the form_verify endpoint. */
export type ApiResponse = {
  state: ValidationState;
  sub_state: ValidationSubState;
  email: string;
  suggestion?: string;
  free_email?: boolean;
  role?: boolean;
};
