import { verifyEmail } from "./client";
import type { TruelistConfig, ValidationState } from "./types";

export type TruelistFieldValidatorOptions = TruelistConfig & {
  /**
   * Which validation states to treat as invalid.
   * Default: `["invalid"]`
   */
  rejectStates?: ValidationState[];
  /** Error message returned when validation fails. */
  message?: string;
};

/**
 * Creates a validation function compatible with React Hook Form's `validate` option.
 *
 * Use with `register()` to validate email fields via the Truelist API.
 *
 * @example
 * ```tsx
 * import { useForm } from "react-hook-form";
 * import { truelistFieldValidator } from "@truelist/react/react-hook-form";
 *
 * function MyForm() {
 *   const { register, handleSubmit } = useForm();
 *   const validate = truelistFieldValidator({
 *     apiKey: "your-form-api-key",
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register("email", { validate })} type="email" />
 *     </form>
 *   );
 * }
 * ```
 */
export function truelistFieldValidator(
  options: TruelistFieldValidatorOptions
): (value: string) => Promise<string | true> {
  const {
    apiKey,
    baseUrl,
    rejectStates = ["invalid"],
    message = "This email address is not valid.",
  } = options;

  return async (value: string) => {
    if (!value || !value.includes("@")) {
      return true;
    }

    try {
      const result = await verifyEmail(value, { apiKey, baseUrl });

      if (rejectStates.includes(result.state)) {
        return message;
      }

      return true;
    } catch {
      // If the API is unavailable, don't block form submission
      return true;
    }
  };
}
