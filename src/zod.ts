import { z } from "zod";
import type { ZodType } from "zod";
import { verifyEmail, TruelistApiError } from "./client";
import type { TruelistConfig, ValidationState } from "./types";

export type TruelistEmailOptions = TruelistConfig & {
  /**
   * Which validation states to treat as invalid.
   * Default: `["email_invalid"]`
   *
   * Example: reject unknown emails too with `["email_invalid", "unknown"]`.
   */
  rejectStates?: ValidationState[];
  /** Custom error message. Default: "This email address is not valid." */
  message?: string;
};

/**
 * Creates a Zod string schema that validates emails via the Truelist API.
 *
 * Works server-side -- does not depend on `TruelistProvider`.
 * Requires `zod` as a peer dependency.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { truelistEmail } from "@truelist/react/zod";
 *
 * const schema = z.object({
 *   email: truelistEmail({ apiKey: "your-api-key" }),
 * });
 *
 * // Async validation
 * const result = await schema.parseAsync({ email: "user@example.com" });
 * ```
 */
export function truelistEmail(options: TruelistEmailOptions): ZodType<string> {
  const {
    apiKey,
    baseUrl,
    rejectStates = ["email_invalid"],
    message = "This email address is not valid.",
  } = options;

  return z
    .string()
    .email("Please enter a valid email address.")
    .refine(
      async (email) => {
        try {
          const result = await verifyEmail(email, { apiKey, baseUrl });
          return !rejectStates.includes(result.state);
        } catch (err) {
          // Auth errors must always surface -- never silently swallow a 401
          if (err instanceof TruelistApiError && err.status === 401) {
            throw err;
          }
          // If the API is unavailable, don't block form submission
          return true;
        }
      },
      { message }
    );
}
