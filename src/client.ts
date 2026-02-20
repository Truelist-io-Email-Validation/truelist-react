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
 * Validates an email address using the Truelist form_verify API.
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
  const url = `${baseUrl}/api/v1/form_verify`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ email }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new TruelistApiError(
        "Rate limit exceeded. The form API allows 60 requests per minute.",
        429
      );
    }

    if (response.status === 401) {
      throw new TruelistApiError(
        "Invalid API key. Check your Truelist form API key.",
        401
      );
    }

    throw new TruelistApiError(
      `Truelist API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data: ApiResponse = await response.json();

  return {
    state: data.state,
    subState: data.sub_state,
    email: data.email,
    suggestion: data.suggestion,
    freeEmail: data.free_email,
    role: data.role,
  };
}
