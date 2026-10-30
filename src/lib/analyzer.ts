import { ApiUsage, ImpactFinding, RepoFile } from "@/types";

export function analyzeImpact(
  usages: ApiUsage[],
  files: RepoFile[],
  changelogText: string
): ImpactFinding[] {
  const rawFindings: ImpactFinding[] = [];
  const lowerChangelog = changelogText.toLowerCase();

  for (const usage of usages) {
    let matched = false;

    // Rule 1: Stripe invoice pointer deprecation
    if (
      usage.symbol === "invoice.payment_intent" &&
      (lowerChangelog.includes("payment_intent") ||
        lowerChangelog.includes("invoice") ||
        lowerChangelog.includes("basil"))
    ) {
      rawFindings.push({
        id: `impact-${usage.id}`,
        file: usage.file,
        line: usage.line,
        severity: "critical",
        title: "Removed Invoice Pointer Attribute",
        matchedUsageId: usage.id,
        explanation:
          "Top-level invoice pointer fields are removed in Stripe 2025-03-31 (Basil). Reading invoice.payment_intent yields undefined.",
        originalSnippet: usage.rawCode,
        proposedSnippet:
          "paymentIntentId: invoice.payments?.data?.find(p => p.payment?.type === 'payment_intent')?.payment?.payment_intent ?? null,",
        migrationAdvice:
          "Query invoice.payments.data and extract payment ID from the nested payment object.",
        ruleCategory: "Breaking Field Removal",
      });
      matched = true;
    }

    // Rule 2: Stripe direct charge creation deprecation
    if (
      usage.symbol === "stripe.charges.create" &&
      (lowerChangelog.includes("charge") ||
        lowerChangelog.includes("charges.create") ||
        lowerChangelog.includes("paymentintent"))
    ) {
      rawFindings.push({
        id: `impact-${usage.id}`,
        file: usage.file,
        line: usage.line,
        severity: "breaking",
        title: "Deprecated Charges Create Endpoint",
        matchedUsageId: usage.id,
        explanation:
          "Direct charge creation is superseded by PaymentIntents and lacks built-in SCA/3DS authorization flows.",
        originalSnippet: usage.rawCode,
        proposedSnippet: "const paymentIntent = await stripe.paymentIntents.create({",
        migrationAdvice:
          "Migrate to stripe.paymentIntents.create({ ...params, confirm: true }) for SCA compliance.",
        ruleCategory: "Method Deprecation",
      });
      matched = true;
    }

    // Rule 3: Stripe API Version Pin warning
    if (
      usage.symbol === "apiVersion" &&
      (lowerChangelog.includes("version") || lowerChangelog.includes("basil"))
    ) {
      rawFindings.push({
        id: `impact-${usage.id}`,
        file: usage.file,
        line: usage.line,
        severity: "warning",
        title: "Outdated API Version Reference",
        matchedUsageId: usage.id,
        explanation:
          "The client initialization pins an older Stripe API version that defaults to legacy response contracts.",
        originalSnippet: usage.rawCode,
        proposedSnippet: "apiVersion: '2025-03-31.basil',",
        migrationAdvice:
          "Update the initialized apiVersion pin to match the tested SDK version.",
        ruleCategory: "Version Drift",
      });
      matched = true;
    }

    // Rule 4: Firebase Modular SDK v9
    if (
      (usage.symbol === "firebase.auth()" ||
        usage.symbol === "firebase/app (namespaced)" ||
        usage.symbol === "signInWithEmailAndPassword" ||
        usage.symbol === "signOut") &&
      (lowerChangelog.includes("modular") ||
        lowerChangelog.includes("firebase") ||
        lowerChangelog.includes("v9"))
    ) {
      if (usage.symbol === "firebase/app (namespaced)") {
        rawFindings.push({
          id: `impact-${usage.id}`,
          file: usage.file,
          line: usage.line,
          severity: "breaking",
          title: "Legacy Firebase Namespace Import",
          matchedUsageId: usage.id,
          explanation:
            "Root namespace imports are deprecated in favor of modular tree-shakeable functional packages.",
          originalSnippet: usage.rawCode,
          proposedSnippet:
            "import { initializeApp, getApps } from 'firebase/app';\nimport { getAuth } from 'firebase/auth';",
          migrationAdvice:
            "Import individual services directly from 'firebase/app' and 'firebase/auth'.",
          ruleCategory: "Architecture Shift",
        });
        matched = true;
      } else if (usage.rawCode.includes("signInWithEmailAndPassword")) {
        rawFindings.push({
          id: `impact-${usage.id}`,
          file: usage.file,
          line: usage.line,
          severity: "breaking",
          title: "Chained Auth Sign-In Call",
          matchedUsageId: usage.id,
          explanation:
            "Prototype methods on firebase.auth() must be replaced with standalone functional calls.",
          originalSnippet: usage.rawCode,
          proposedSnippet:
            "const userCredential = await signInWithEmailAndPassword(auth, email, password);",
          migrationAdvice:
            "Pass the initialized auth instance as the first argument to signInWithEmailAndPassword.",
          ruleCategory: "Architecture Shift",
        });
        matched = true;
      } else if (usage.rawCode.includes("signOut")) {
        rawFindings.push({
          id: `impact-${usage.id}`,
          file: usage.file,
          line: usage.line,
          severity: "breaking",
          title: "Chained Auth Sign-Out Call",
          matchedUsageId: usage.id,
          explanation:
            "Chained auth().signOut() is replaced by the standalone signOut function.",
          originalSnippet: usage.rawCode,
          proposedSnippet: "await signOut(auth);",
          migrationAdvice:
            "Call signOut(auth) imported from 'firebase/auth'.",
          ruleCategory: "Architecture Shift",
        });
        matched = true;
      } else if (usage.rawCode.includes("onAuthStateChanged")) {
        rawFindings.push({
          id: `impact-${usage.id}`,
          file: usage.file,
          line: usage.line,
          severity: "breaking",
          title: "Chained Auth State Listener",
          matchedUsageId: usage.id,
          explanation:
            "Chained auth().onAuthStateChanged is replaced by the functional listener.",
          originalSnippet: usage.rawCode,
          proposedSnippet:
            "return onAuthStateChanged(auth, (user) => { callback(user); });",
          migrationAdvice:
            "Pass the auth instance as first argument to onAuthStateChanged(auth, callback).",
          ruleCategory: "Architecture Shift",
        });
        matched = true;
      }
    }

    // Rule 5: OpenAI Completion API deprecation
    if (
      (usage.symbol === "openai.Completion.create" ||
        usage.symbol === "text-davinci-003") &&
      (lowerChangelog.includes("davinci") ||
        lowerChangelog.includes("completion") ||
        lowerChangelog.includes("chat"))
    ) {
      rawFindings.push({
        id: `impact-${usage.id}`,
        file: usage.file,
        line: usage.line,
        severity: "critical",
        title: "Sunset Completions API Endpoint",
        matchedUsageId: usage.id,
        explanation:
          "The legacy /v1/completions endpoint and text-davinci-003 model are permanently discontinued.",
        originalSnippet: usage.rawCode,
        proposedSnippet:
          'client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])',
        migrationAdvice:
          "Migrate to client.chat.completions.create using modern chat models like gpt-4o-mini.",
        ruleCategory: "API Sunset",
      });
      matched = true;
    }

    // Rule 6: GitHub ?access_token= Query Parameter
    if (
      usage.symbol === "?access_token= URL Query Token" &&
      (lowerChangelog.includes("access_token") ||
        lowerChangelog.includes("token") ||
        lowerChangelog.includes("github"))
    ) {
      rawFindings.push({
        id: `impact-${usage.id}`,
        file: usage.file,
        line: usage.line,
        severity: "critical",
        title: "Disallowed Query Token Parameter",
        matchedUsageId: usage.id,
        explanation:
          "Passing access tokens via URL query parameters is blocked to prevent accidental credential leakage.",
        originalSnippet: usage.rawCode,
        proposedSnippet: "headers: { Authorization: `Bearer ${token}` }",
        migrationAdvice:
          "Transmit authentication tokens strictly inside the Authorization: Bearer HTTP header.",
        ruleCategory: "Security Deprecation",
      });
      matched = true;
    }

    // Rule 7: Heuristic general detection if custom changelog mentions symbol
    if (!matched) {
      const symbolKeywords = usage.symbol
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4);

      const hasMatch = symbolKeywords.some((word) => lowerChangelog.includes(word));
      if (hasMatch) {
        rawFindings.push({
          id: `impact-${usage.id}`,
          file: usage.file,
          line: usage.line,
          severity: "warning",
          title: `Detected Reference: ${usage.symbol}`,
          matchedUsageId: usage.id,
          explanation: `The identifier '${usage.symbol}' is cited in the submitted API changelog.`,
          originalSnippet: usage.rawCode,
          proposedSnippet: `// Verify compatibility with new API specification for: ${usage.symbol}`,
          migrationAdvice:
            "Review this reference against the updated provider contract.",
          ruleCategory: "Heuristic Match",
        });
      }
    }
  }

  // Deduplicate findings: keep at most one finding per (file, line) and per (file, title)
  const seenKeys = new Set<string>();
  const deduplicated: ImpactFinding[] = [];

  for (const f of rawFindings) {
    const lineKey = `${f.file}:${f.line}`;
    const titleKey = `${f.file}:${f.title}`;
    if (!seenKeys.has(lineKey) && !seenKeys.has(titleKey)) {
      seenKeys.add(lineKey);
      seenKeys.add(titleKey);
      deduplicated.push(f);
    }
  }

  return deduplicated;
}
