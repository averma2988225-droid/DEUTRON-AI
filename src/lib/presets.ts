import { ChangelogPreset } from "@/types";

export const CHANGELOG_PRESETS: ChangelogPreset[] = [
  {
    id: "stripe-basil-invoices",
    title: "Stripe API 2025-03-31 (Basil Release)",
    provider: "stripe",
    version: "2025-03-31.basil",
    tagline: "Removal of direct Invoice payment_intent & charge pointer fields",
    recommendedRepoUrl: "https://github.com/patchpilot-demo/saas-billing-service",
    changelogText: `### Stripe API Version 2025-03-31 (Basil) Breaking Changes

1. **Invoice Object Schema Simplification**:
   - The direct pointer attributes \`invoice.payment_intent\`, \`invoice.charge\`, \`invoice.paid\`, and \`invoice.paid_out_of_band\` on the \`Invoice\` object have been permanently removed.
   - Applications must now inspect the new \`invoice.payments\` sub-resource instead of reading direct top-level pointer fields.
   - Specifically, to retrieve associated payment intent IDs for an invoice, iterate through \`invoice.payments.data[]\` and extract \`item.payment.payment_intent\` where \`item.payment.type === "payment_intent"\`.
   - Direct access such as \`invoice.payment_intent\` or \`invoice["payment_intent"]\` will return \`undefined\` in JavaScript / raise \`KeyError\` in Python.

2. **Charge Creation Deprecation**:
   - Creating direct charges via \`stripe.charges.create()\` is officially deprecated in favor of PaymentIntents API (\`stripe.paymentIntents.create()\`).
   - Legacy adapters using \`stripe.charges.create({ amount, currency, source })\` must be upgraded to create PaymentIntents with automatic confirmation.`,
  },
  {
    id: "firebase-modular-v9",
    title: "Firebase JavaScript SDK v8 to v9 Modular",
    provider: "firebase",
    version: "9.0.0",
    tagline: "Namespaced SDK deprecated in favor of functional tree-shakeable imports",
    recommendedRepoUrl: "https://github.com/patchpilot-demo/firebase-auth-portal",
    changelogText: `### Firebase JavaScript SDK v9 (Modular) Breaking Changes

1. **Deprecation of Namespaced API**:
   - The legacy namespaced \`firebase.auth()\` and \`firebase.firestore()\` chains have been superseded by functional imports from sub-packages.
   - \`import firebase from "firebase/compat/app"\` or \`import firebase from "firebase/app"\` with chained calls like \`firebase.auth().signInWithEmailAndPassword(email, password)\` must be migrated.
   
2. **New Functional Calling Convention**:
   - Use: \`import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"\`
   - Authentication instance must be initialized once: \`const auth = getAuth(app);\`
   - Methods take \`auth\` as the first parameter: \`signInWithEmailAndPassword(auth, email, password)\`.`,
  },
  {
    id: "openai-chat-migration",
    title: "OpenAI Legacy Completions Deprecation",
    provider: "openai",
    version: "v1.0.0+",
    tagline: "Migration from legacy text-davinci-003 to Chat Completions API",
    recommendedRepoUrl: "https://github.com/patchpilot-demo/ai-knowledge-agent",
    changelogText: `### OpenAI API Legacy Completions Deprecation

1. **Completions Endpoint Sunset**:
   - The endpoint \`/v1/completions\` and model \`text-davinci-003\` are deprecated.
   - Calls using \`openai.Completion.create(model="text-davinci-003", prompt=prompt)\` fail with HTTP 404 or 400 Bad Request.
   
2. **Chat Completions Standard**:
   - All text generation must use the \`/v1/chat/completions\` endpoint.
   - In Python/Node SDK: replace \`openai.Completion.create\` with \`client.chat.completions.create\`.
   - Update parameters: \`prompt\` string becomes \`messages=[{"role": "user", "content": prompt}]\`.
   - Model name must be updated from \`text-davinci-003\` to \`gpt-4o-mini\` or \`gpt-4o\`.
   - Response structure change: Access output text via \`response.choices[0].message.content\` instead of \`response.choices[0].text\`.`,
  },
  {
    id: "github-query-token-deprecation",
    title: "GitHub REST API Query Parameter Auth Deprecation",
    provider: "github",
    version: "2022-11-28",
    tagline: "Sunset of ?access_token= in URL query strings",
    recommendedRepoUrl: "https://github.com/patchpilot-demo/github-webhook-orchestrator",
    changelogText: `### GitHub REST API Authentication Hardening

1. **Query String Token Removal**:
   - Authenticating to the GitHub REST API by appending \`?access_token=TOKEN\` to URL requests is completely discontinued.
   - Any requests with \`?access_token=\` will be rejected with HTTP 401 Unauthorized.
   
2. **Mandatory Authorization Header**:
   - All requests must include an \`Authorization\` header:
     \`Authorization: Bearer <TOKEN>\` or \`Authorization: token <TOKEN>\`.
   - When using Octokit, initialize with \`new Octokit({ auth: TOKEN })\` rather than manual query parameter formatting.`,
  },
];

