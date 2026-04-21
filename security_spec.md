# Security Spec: Feedback Box

## Data Invariants
- Nicknames must be between 1 and 30 characters.
- Content must be between 1 and 1000 characters.
- Rating must be an integer between 1 and 5.
- `createdAt` must be set to the server time.
- Users can read all feedbacks.
- Anyone can create a feedback (anonymous submission allowed).
- No one can update or delete feedbacks once submitted.

## The "Dirty Dozen" Payloads (Deny)
1. Missing `nickname`.
2. `nickname` is too long (e.g., 500 chars).
3. `nickname` is not a string.
4. Missing `content`.
5. `content` is empty string.
6. `content` is too long (e.g., 5000 chars).
7. `rating` is missing.
8. `rating` is 0 or 6.
9. `rating` is a string "5".
10. `createdAt` is a client-provided hardcoded date.
11. Attempting to `update` a document.
12. Attempting to `delete` a document.

## Test Runner (Logic)
```typescript
import { assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
// ... (Tests would go here in a test environment)
```
