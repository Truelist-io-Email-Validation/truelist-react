# @truelist/react

React hooks and components for real-time email validation with [Truelist.io](https://truelist.io).

Validate emails at the point of entry with a headless hook, a composable input component, or integrations for Zod and React Hook Form.

```bash
npm install @truelist/react
```

## Quick Start

Wrap your app with the provider and use the hook:

```tsx
import { TruelistProvider, useEmailValidation } from "@truelist/react";

function App() {
  return (
    <TruelistProvider apiKey="your-api-key">
      <SignupForm />
    </TruelistProvider>
  );
}

function SignupForm() {
  const { validate, result, isValidating } = useEmailValidation();

  return (
    <input
      type="email"
      onChange={(e) => validate(e.target.value)}
      aria-invalid={result?.state === "email_invalid"}
    />
  );
}
```

## Hook: `useEmailValidation`

The primary way to add email validation to any UI. Headless by design -- you control the rendering.

```tsx
import { useEmailValidation } from "@truelist/react";

function EmailField() {
  const { validate, result, isValidating, error, reset } = useEmailValidation({
    debounceMs: 500, // default
    onResult: (result) => console.log(result),
    onError: (error) => console.error(error),
  });

  return (
    <div>
      <input
        type="email"
        onChange={(e) => validate(e.target.value)}
        placeholder="you@example.com"
      />
      {isValidating && <span>Checking...</span>}
      {result?.state === "email_invalid" && <span>This email is not valid.</span>}
      {result?.state === "accept_all" && <span>This email may not be verifiable.</span>}
      {result?.suggestion && <span>Did you mean {result.suggestion}?</span>}
      {error && <span>{error}</span>}
      <button onClick={reset}>Clear</button>
    </div>
  );
}
```

### Return Value

| Property | Type | Description |
|---|---|---|
| `validate` | `(email: string) => void` | Trigger validation (debounced by default) |
| `result` | `ValidationResult \| null` | The validation result, or null |
| `isValidating` | `boolean` | Whether a request is in-flight |
| `error` | `string \| null` | Error message, or null |
| `reset` | `() => void` | Clear result, error, and abort pending requests |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `debounceMs` | `number` | `500` | Debounce delay. Set to 0 to disable. |
| `onResult` | `(result: ValidationResult) => void` | -- | Callback when validation succeeds |
| `onError` | `(error: string) => void` | -- | Callback when validation fails |

## Component: `EmailInput`

A composable, unstyled email input with built-in validation.

```tsx
import { EmailInput } from "@truelist/react";

<EmailInput
  validateOn="blur"
  debounceMs={500}
  onValidation={(result) => console.log(result)}
  placeholder="you@example.com"
/>
```

### Styling with Data Attributes

The input exposes a `data-validation-state` attribute for CSS styling:

```css
input[data-validation-state="ok"] {
  border-color: green;
}

input[data-validation-state="email_invalid"] {
  border-color: red;
}

input[data-validation-state="accept_all"] {
  border-color: orange;
}

input[data-validation-state="validating"] {
  border-color: blue;
}
```

### Props

All standard `<input>` props are supported, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `validateOn` | `"blur" \| "change"` | `"blur"` | When to trigger validation |
| `debounceMs` | `number` | `500` | Debounce delay for "change" mode |
| `onValidation` | `(result: ValidationResult) => void` | -- | Callback when validation completes |
| `renderSuggestion` | `(suggestion: string) => ReactNode` | -- | Custom suggestion renderer |
| `renderError` | `(error: string) => ReactNode` | -- | Custom error renderer |

## Zod Integration

Validate emails server-side or in form schemas with Zod. Import from `@truelist/react/zod`.

```ts
import { z } from "zod";
import { truelistEmail } from "@truelist/react/zod";

const schema = z.object({
  email: truelistEmail({ apiKey: "your-api-key" }),
});

// Async validation (required for API calls)
const result = await schema.parseAsync({ email: "user@example.com" });
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | *required* | Your Truelist API key |
| `baseUrl` | `string` | `https://api.truelist.io` | Custom API base URL |
| `rejectStates` | `ValidationState[]` | `["email_invalid"]` | States that fail validation |
| `message` | `string` | `"This email address is not valid."` | Error message |

Reject unknown emails too:

```ts
truelistEmail({
  apiKey: "your-api-key",
  rejectStates: ["email_invalid", "unknown"],
});
```

## React Hook Form Integration

Plug into React Hook Form's field validation. Import from `@truelist/react/react-hook-form`.

```tsx
import { useForm } from "react-hook-form";
import { truelistFieldValidator } from "@truelist/react/react-hook-form";

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const validate = truelistFieldValidator({ apiKey: "your-api-key" });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email", { validate })} type="email" />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | *required* | Your Truelist API key |
| `baseUrl` | `string` | `https://api.truelist.io` | Custom API base URL |
| `rejectStates` | `ValidationState[]` | `["email_invalid"]` | States that fail validation |
| `message` | `string` | `"This email address is not valid."` | Error message |

## Types

```ts
import type {
  ValidationState,
  ValidationSubState,
  ValidationResult,
  TruelistConfig,
} from "@truelist/react";
```

### `ValidationState`

```ts
type ValidationState = "ok" | "email_invalid" | "accept_all" | "unknown";
```

### `ValidationSubState`

```ts
type ValidationSubState =
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
```

### `ValidationResult`

```ts
type ValidationResult = {
  state: ValidationState;
  subState: ValidationSubState;
  email: string;
  domain: string;
  canonical: string;
  mxRecord: string | null;
  firstName: string | null;
  lastName: string | null;
  verifiedAt: string;
  suggestion: string | null;
};
```

### `TruelistConfig`

```ts
type TruelistConfig = {
  apiKey: string;
  baseUrl?: string;
};
```

## Configuration

### Provider

Wrap your app with `TruelistProvider` to make the API key available to all hooks and components:

```tsx
<TruelistProvider apiKey="your-api-key" baseUrl="https://api.truelist.io">
  <App />
</TruelistProvider>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | *required* | Your Truelist API key |
| `baseUrl` | `string` | `https://api.truelist.io` | Custom API base URL |

### API Details

- **Endpoint**: `POST https://api.truelist.io/api/v1/verify_inline?email=user@example.com`
- **Auth**: Bearer token (your API key)
- **Response**: `{ "emails": [{ "address": "...", "email_state": "ok", ... }] }`

Get your API key at [truelist.io](https://truelist.io).

## License

MIT
