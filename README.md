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
    <TruelistProvider apiKey="your-form-api-key">
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
      aria-invalid={result?.state === "invalid"}
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
      {result?.state === "invalid" && <span>This email is not valid.</span>}
      {result?.state === "risky" && <span>This email may not receive mail.</span>}
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
input[data-validation-state="valid"] {
  border-color: green;
}

input[data-validation-state="invalid"] {
  border-color: red;
}

input[data-validation-state="risky"] {
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
| `validateOn` | `"blur" \| "change" \| "submit"` | `"blur"` | When to trigger validation |
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
  email: truelistEmail({ apiKey: "your-form-api-key" }),
});

// Async validation (required for API calls)
const result = await schema.parseAsync({ email: "user@example.com" });
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | *required* | Your Truelist form API key |
| `baseUrl` | `string` | `https://api.truelist.io` | Custom API base URL |
| `rejectStates` | `ValidationState[]` | `["invalid"]` | States that fail validation |
| `message` | `string` | `"This email address is not valid."` | Error message |

Reject risky emails too:

```ts
truelistEmail({
  apiKey: "your-form-api-key",
  rejectStates: ["invalid", "risky"],
});
```

## React Hook Form Integration

Plug into React Hook Form's field validation. Import from `@truelist/react/react-hook-form`.

```tsx
import { useForm } from "react-hook-form";
import { truelistFieldValidator } from "@truelist/react/react-hook-form";

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const validate = truelistFieldValidator({ apiKey: "your-form-api-key" });

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
| `apiKey` | `string` | *required* | Your Truelist form API key |
| `baseUrl` | `string` | `https://api.truelist.io` | Custom API base URL |
| `rejectStates` | `ValidationState[]` | `["invalid"]` | States that fail validation |
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
type ValidationState = "valid" | "invalid" | "risky" | "unknown";
```

### `ValidationSubState`

```ts
type ValidationSubState =
  | "ok"
  | "accept_all"
  | "disposable_address"
  | "role_address"
  | "failed_mx_check"
  | "failed_spam_trap"
  | "failed_no_mailbox"
  | "failed_greylisted"
  | "failed_syntax_check"
  | "unknown";
```

### `ValidationResult`

```ts
type ValidationResult = {
  state: ValidationState;
  subState: ValidationSubState;
  email: string;
  suggestion?: string;
  freeEmail?: boolean;
  role?: boolean;
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
<TruelistProvider apiKey="your-form-api-key" baseUrl="https://api.truelist.io">
  <App />
</TruelistProvider>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | *required* | Your Truelist form API key |
| `baseUrl` | `string` | `https://api.truelist.io` | Custom API base URL |

### API Details

- **Endpoint**: `POST https://api.truelist.io/api/v1/form_verify`
- **Auth**: Bearer token (your form API key)
- **Rate limit**: 60 requests per minute for form keys
- **Billing**: Credits are only charged for definitive results (`valid`/`invalid`), not for `unknown`

Get your API key at [truelist.io](https://truelist.io).

## License

MIT
