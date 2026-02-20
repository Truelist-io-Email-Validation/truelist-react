import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { TruelistConfig } from "./types";

const TruelistContext = createContext<TruelistConfig | null>(null);

export type TruelistProviderProps = {
  /** Your Truelist form API key. */
  apiKey: string;
  /** Base URL for the Truelist API. Defaults to `https://api.truelist.io`. */
  baseUrl?: string;
  children: ReactNode;
};

/**
 * Provides Truelist configuration to all child hooks and components.
 *
 * Wrap your app (or the relevant subtree) with this provider
 * to avoid passing the API key to every hook call.
 *
 * @example
 * ```tsx
 * <TruelistProvider apiKey="your-form-api-key">
 *   <App />
 * </TruelistProvider>
 * ```
 */
export function TruelistProvider({
  apiKey,
  baseUrl,
  children,
}: TruelistProviderProps) {
  const config = useMemo<TruelistConfig>(
    () => ({ apiKey, baseUrl }),
    [apiKey, baseUrl]
  );

  return (
    <TruelistContext.Provider value={config}>
      {children}
    </TruelistContext.Provider>
  );
}

/**
 * Returns the Truelist configuration from the nearest `TruelistProvider`.
 *
 * @throws If called outside of a `TruelistProvider`.
 */
export function useTruelistConfig(): TruelistConfig {
  const config = useContext(TruelistContext);

  if (!config) {
    throw new Error(
      "useTruelistConfig must be used within a <TruelistProvider>. " +
        "Wrap your component tree with <TruelistProvider apiKey=\"...\">."
    );
  }

  return config;
}
