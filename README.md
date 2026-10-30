# PatchPilot

> **Detect API changes. Find affected code. Generate reliable fixes.**

PatchPilot is an AI-powered API change detection and automated code repair platform designed for engineering teams maintaining third-party integrations (Stripe, Firebase, OpenAI, GitHub, and more).

---

## 1. Problem Statement

Modern applications depend on numerous third-party APIs. When providers release breaking changes or deprecate endpoints:
- Endpoints and query parameters are removed or renamed.
- Response payloads and object pointers change.
- Existing integrations fail silently or crash in production.

Developers typically spend hours reading changelogs, manually searching codebases, and figuring out replacement contracts. **PatchPilot automates this workflow with deterministic precision and evidence-backed AI repairs.**

---

## 2. Core Architecture Pipeline

PatchPilot separates detection, AI reasoning, patch generation, and verification into independent stages. The LLM is **never** the sole source of truth; deterministic scanning and evidence validation ground its findings:

```
Public GitHub Repository
        ↓
[1] Repository Connection & Retrieval Engine (GitHub REST API v3)
        ↓
[2] File Tree Indexing & Candidate Filtering (.ts, .js, .py, .go, .php)
        ↓
[3] Deterministic API Usage Detection Engine (Language-Aware Patterns)
        ↓
[4] API Changelog Impact Analyzer (Severity Classification: Critical/Breaking)
        ↓
[5] Evidence Validation & Snippet Isolation
        ↓
[6] AI Code Repair Engine (Surgical Diff Synthesis)
        ↓
[7] Structural & Safety Verification (Bracket Balance, Secret Check)
        ↓
[8] Developer Review Dashboard (Unified Diff, Copy/Download .patch)
```

---

## 3. Key Features (P0 Production Scope)

- **Public GitHub Repository Inspection**: Connects via URL or `owner/repo` shorthand, fetching file trees and commits without requiring repository write permissions.
- **Deterministic API Usage Detection**: Scans imports, HTTP client calls, method invocations, parameter pointers, and API version pins across languages.
- **Evidence-Backed Affected Code Identification**: Cites exact file paths, line references, and surrounding code context.
- **AI-Powered Code Repair**: Synthesizes clean, minimal code replacements tailored to the new API specification.
- **Interactive Unified Diff Viewer**: Color-coded additions/deletions, copy patch to clipboard, and 1-click `.patch` file download.
- **Structural Patch Verification**: Validates AST bracket balancing, confirms zero leaked credentials, and ensures reversibility before presenting to the developer.
- **Strict Safety Guarantee**: **Never** automatically pushes unreviewed code to your repository.

---

## 4. Built-in Demonstration Scenarios

PatchPilot includes 4 ready-to-run presets with realistic codebases for instant hackathon evaluation:

1. **Stripe 2025-03-31 (Basil Release)**:
   - *Breaking Change*: Direct `invoice.payment_intent` and `invoice.charge` fields removed from the Invoice object.
   - *Repair*: Migrates invoice adapter to read `invoice.payments.data[]` and upgrades `charges.create` to `paymentIntents.create`.
2. **Firebase JS SDK v8 to v9 Modular Architecture**:
   - *Breaking Change*: Namespaced chaining `firebase.auth().signInWithEmailAndPassword()` deprecated.
   - *Repair*: Migrates to functional tree-shakeable imports: `signInWithEmailAndPassword(auth, email, password)`.
3. **OpenAI Completions API Sunset**:
   - *Breaking Change*: Legacy `/v1/completions` endpoint and `text-davinci-003` model sunset.
   - *Repair*: Upgrades to `chat.completions.create` with `gpt-4o-mini` and messages format.
4. **GitHub REST API Query Token Deprecation**:
   - *Breaking Change*: Sunset of `?access_token=TOKEN` query parameter authentication.
   - *Repair*: Upgrades requests to `Authorization: Bearer <TOKEN>` HTTP headers.

---

## 5. Technology Stack

- **Frontend & Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Gemini API (`@google/generative-ai`) with deterministic rule grounding
- **Diff Engine**: Unified diff generation (`diff`) with RFC 4166 compatibility
- **Icons**: Lucide Icons
- **Repository Integration**: GitHub REST API v3

---

## 6. Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/sankalp2515/PatchPilot.git
cd PatchPilot

# Install dependencies
yarn install # or npm install

# Run the local development server
yarn dev # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional Environment Variables (`.env.local`)
```env
# Optional: GitHub token for higher API rate limits on private/large public repos
GITHUB_TOKEN=your_github_token_here

# Optional: Gemini API Key for dynamic patch generation on arbitrary unlisted APIs
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: PatchPilot is fully functional out of the box with built-in presets even without API keys.*
