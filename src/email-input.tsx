import { forwardRef, useCallback, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { useEmailValidation } from "./use-email-validation";
import type { UseEmailValidationOptions } from "./use-email-validation";
import type { ValidationResult, ValidationState } from "./types";

export type ValidateOn = "blur" | "change";

export type EmailInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  /** When to trigger validation. Default: "blur". */
  validateOn?: ValidateOn;
  /** Debounce delay in milliseconds. Default: 500. */
  debounceMs?: number;
  /** Callback fired when validation completes. */
  onValidation?: (result: ValidationResult) => void;
  /**
   * Render function for the suggestion message.
   * Receives the suggested correction (e.g. "user@gmail.com").
   * If not provided, a default message is rendered as a `<span>`.
   */
  renderSuggestion?: (suggestion: string) => React.ReactNode;
  /**
   * Render function for the error message.
   * If not provided, a default message is rendered as a `<span>`.
   */
  renderError?: (error: string) => React.ReactNode;
  /** Additional options passed to the underlying `useEmailValidation` hook. */
  validationOptions?: Omit<
    UseEmailValidationOptions,
    "debounceMs" | "onResult"
  >;
};

/**
 * A composable, unstyled email input that validates via the Truelist API.
 *
 * Exposes validation state through `data-validation-state` for easy styling.
 * Renders an `<input type="email">` with optional suggestion and error messages.
 *
 * Must be used within a `<TruelistProvider>`.
 *
 * @example
 * ```tsx
 * <EmailInput
 *   validateOn="blur"
 *   onValidation={(result) => console.log(result)}
 *   placeholder="you@example.com"
 * />
 * ```
 */
export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput(
    {
      validateOn = "blur",
      debounceMs = 500,
      onValidation,
      renderSuggestion,
      renderError,
      validationOptions,
      onChange,
      onBlur,
      ...inputProps
    },
    ref
  ) {
    const [value, setValue] = useState(
      (inputProps.defaultValue as string) ?? ""
    );

    const { validate, result, isValidating, error, reset } =
      useEmailValidation({
        debounceMs: validateOn === "change" ? debounceMs : 0,
        onResult: onValidation,
        ...validationOptions,
      });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange?.(e);

        if (validateOn === "change") {
          validate(newValue);
        } else {
          // Reset state when typing after a previous validation
          if (result || error) {
            reset();
          }
        }
      },
      [onChange, validateOn, validate, result, error, reset]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);

        if (validateOn === "blur" && e.target.value) {
          validate(e.target.value);
        }
      },
      [onBlur, validateOn, validate]
    );

    const dataState = getDataState(result?.state, isValidating);

    return (
      <div data-truelist-wrapper="">
        <input
          {...inputProps}
          ref={ref}
          type="email"
          value={inputProps.value ?? value}
          onChange={handleChange}
          onBlur={handleBlur}
          data-validation-state={dataState}
          aria-invalid={result?.state === "email_invalid" || undefined}
        />
        {result?.suggestion &&
          (renderSuggestion ? (
            renderSuggestion(result.suggestion)
          ) : (
            <span data-truelist-suggestion="">
              Did you mean {result.suggestion}?
            </span>
          ))}
        {error &&
          (renderError ? (
            renderError(error)
          ) : (
            <span data-truelist-error="">{error}</span>
          ))}
      </div>
    );
  }
);

function getDataState(
  state: ValidationState | undefined,
  isValidating: boolean
): string {
  if (isValidating) return "validating";
  if (state) return state;
  return "idle";
}
