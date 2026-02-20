import { useCallback, useEffect, useRef, useState } from "react";
import { verifyEmail, TruelistApiError } from "./client";
import { useTruelistConfig } from "./provider";
import type { ValidationResult } from "./types";

export type UseEmailValidationOptions = {
  /** Debounce delay in milliseconds. Set to 0 to disable. Default: 500. */
  debounceMs?: number;
  /** Callback fired when validation completes successfully. */
  onResult?: (result: ValidationResult) => void;
  /** Callback fired when validation fails. */
  onError?: (error: string) => void;
};

export type UseEmailValidationReturn = {
  /** Trigger email validation. Debounced by default. */
  validate: (email: string) => void;
  /** The most recent validation result, or null if not yet validated. */
  result: ValidationResult | null;
  /** Whether a validation request is currently in-flight. */
  isValidating: boolean;
  /** Error message from the last validation attempt, or null. */
  error: string | null;
  /** Reset result and error state. */
  reset: () => void;
};

/**
 * Headless hook for validating email addresses via the Truelist API.
 *
 * Works with any UI. Handles debouncing, request cancellation,
 * and loading/error states automatically.
 *
 * Must be used within a `<TruelistProvider>`.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { validate, result, isValidating, error } = useEmailValidation();
 *
 *   return (
 *     <input
 *       type="email"
 *       onChange={(e) => validate(e.target.value)}
 *       aria-invalid={result?.state === "invalid"}
 *     />
 *   );
 * }
 * ```
 */
export function useEmailValidation(
  options: UseEmailValidationOptions = {}
): UseEmailValidationReturn {
  const { debounceMs = 500, onResult, onError } = options;
  const config = useTruelistConfig();

  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback(
    (email: string) => {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Clear previous state when email is empty or incomplete
      if (!email || !email.includes("@")) {
        setResult(null);
        setError(null);
        setIsValidating(false);
        return;
      }

      const run = () => {
        // Abort any in-flight request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsValidating(true);
        setError(null);

        verifyEmail(email, config, controller.signal)
          .then((validationResult) => {
            // Ignore results from aborted requests
            if (controller.signal.aborted) return;

            setResult(validationResult);
            setIsValidating(false);
            onResult?.(validationResult);
          })
          .catch((err: unknown) => {
            // Ignore aborted requests
            if (err instanceof DOMException && err.name === "AbortError") {
              return;
            }

            const message =
              err instanceof TruelistApiError
                ? err.message
                : "Email validation failed. Please try again.";

            setError(message);
            setIsValidating(false);
            onError?.(message);
          });
      };

      if (debounceMs > 0) {
        debounceTimerRef.current = setTimeout(run, debounceMs);
      } else {
        run();
      }
    },
    [config, debounceMs, onResult, onError]
  );

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setResult(null);
    setError(null);
    setIsValidating(false);
  }, []);

  // Clean up on unmount: cancel pending debounce and in-flight requests
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { validate, result, isValidating, error, reset };
}
