import type { ApiResponse, TruelistConfig, ValidationResult } from "./types";

const DEFAULT_BASE_URL = "https://api.truelist.io";

export class TruelistApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "TruelistApiError";
  }
}

/**
 * Validates an email address using the Truelist API.
 *
 * Works in browsers and edge runtimes (uses `fetch`, no Node.js-specific APIs).
 *
 * @param email - The email address to validate.
 * @param config - API key and optional base URL.
 * @param signal - Optional AbortSignal to cancel the request.
 * @returns The validation result.
 * @throws {TruelistApiError} When the API returns a non-OK response.
 */
export async function verifyEmail(
  email: string,
  config: TruelistConfig,
  signal?: AbortSignal
): Promise<ValidationResult> {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const url = `${baseUrl}/api/v1/verify_inline?email=${encodeURIComponent(email)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new TruelistApiError(
        "Rate limit exceeded. Please try again later.",
        429
      );
    }

    if (response.status === 401) {
      throw new TruelistApiError(
        "Invalid API key. Check your Truelist API key.",
        401
      );
    }

    throw new TruelistApiError(
      `Truelist API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data: ApiResponse = await response.json();
  const record = data.emails[0];

  if (!record) {
    throw new TruelistApiError("No email record returned from API.");
  }

  return {
    state: record.email_state,
    subState: record.email_sub_state,
    email: record.address,
    domain: record.domain,
    canonical: record.canonical,
    mxRecord: record.mx_record,
    firstName: record.first_name,
    lastName: record.last_name,
    verifiedAt: record.verified_at,
    suggestion: record.did_you_mean,
  };
}

/**
 * Fetches account information for the authenticated API key.
 *
 * @param config - API key and optional base URL.
 * @returns The account data.
 * @throws {TruelistApiError} When the API returns a non-OK response.
 */
export async function getAccount(
  config: TruelistConfig
): Promise<Record<string, unknown>> {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const url = `${baseUrl}/me`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new TruelistApiError(
        "Invalid API key. Check your Truelist API key.",
        401
      );
    }

    throw new TruelistApiError(
      `Truelist API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  return response.json() as Promise<Record<string, unknown>>;
}
