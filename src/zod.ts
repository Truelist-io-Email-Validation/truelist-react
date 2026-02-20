import { z } from "zod";
import type { ZodType } from "zod";
import { verifyEmail } from "./client";
import type { TruelistConfig, ValidationState } from "./types";

export type TruelistEmailOptions = TruelistConfig & {
  /**
   * Which API endpoint to use. Default: `"verify"` (server-side).
   * Use `"form_verify"` for client-side usage.
   */
  endpoint?: "form_verify" | "verify";
  /**
   * Which validation states to treat as invalid.
   * Default: `["invalid"]`
   *
   * Example: reject risky emails too with `["invalid", "risky"]`.
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
 *   email: truelistEmail({ apiKey: "your-form-api-key" }),
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
    endpoint,
    rejectStates = ["invalid"],
    message = "This email address is not valid.",
  } = options;

  return z
    .string()
    .email("Please enter a valid email address.")
    .refine(
      async (email) => {
        try {
          const result = await verifyEmail(
            email,
            { apiKey, baseUrl },
            undefined,
            endpoint ?? "verify"
          );
          return !rejectStates.includes(result.state);
        } catch {
          // If the API is unavailable, don't block form submission
          return true;
        }
      },
      { message }
    );
}
