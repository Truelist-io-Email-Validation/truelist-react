/** Primary validation state returned by the Truelist API. */
export type ValidationState = "ok" | "email_invalid" | "risky" | "accept_all" | "unknown";

/** Detailed sub-state providing more context about the validation result. */
export type ValidationSubState =
  | "email_ok"
  | "is_disposable"
  | "is_role"
  | "failed_smtp_check"
  | "failed_mx_check"
  | "failed_spam_trap"
  | "failed_no_mailbox"
  | "failed_greylisted"
  | "failed_syntax_check"
  | "unknown_error";

/** The result object returned after validating an email address. */
export type ValidationResult = {
  /** The primary validation state. */
  state: ValidationState;
  /** Detailed sub-state for the validation result. */
  subState: ValidationSubState;
  /** The email address that was validated. */
  email: string;
  /** The domain portion of the email address. */
  domain: string;
  /** The canonical (local) portion of the email address. */
  canonical: string;
  /** The MX record for the domain, or null. */
  mxRecord: string | null;
  /** First name associated with the email, or null. */
  firstName: string | null;
  /** Last name associated with the email, or null. */
  lastName: string | null;
  /** ISO 8601 timestamp of when the email was verified. */
  verifiedAt: string;
  /** A suggested correction if a typo was detected (e.g. "Did you mean gmail.com?"). */
  suggestion: string | null;
};

/** Configuration for the Truelist provider and API client. */
export type TruelistConfig = {
  /** Your Truelist API key. */
  apiKey: string;
  /** Base URL for the Truelist API. Defaults to `https://api.truelist.io`. */
  baseUrl?: string;
};

/** Raw API response shape from the verify_inline endpoint. */
export type ApiResponse = {
  emails: ApiEmailRecord[];
};

/** A single email record in the API response. */
export type ApiEmailRecord = {
  address: string;
  domain: string;
  canonical: string;
  mx_record: string | null;
  first_name: string | null;
  last_name: string | null;
  email_state: ValidationState;
  email_sub_state: ValidationSubState;
  verified_at: string;
  did_you_mean: string | null;
};
