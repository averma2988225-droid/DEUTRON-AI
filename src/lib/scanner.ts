import { ApiUsage, ApiProviderType, ApiUsageCategory, RepoFile } from "@/types";

interface PatternRule {
  id: string;
  apiType: ApiProviderType;
  category: ApiUsageCategory;
  symbol: string;
  regex: RegExp;
  confidence: "high" | "medium" | "inferred";
}

const RULES: PatternRule[] = [
  // --- Stripe Rules ---
  {
    id: "stripe-import",
    apiType: "stripe",
    category: "import",
    symbol: "Stripe SDK Import",
    regex: /(?:import\s+(?:Stripe|\*\s+as\s+Stripe|\{.*Stripe.*\})\s+from\s+['"]stripe['"]|require\(['"]stripe['"]\)|import\s+stripe)/i,
    confidence: "high",
  },
  {
    id: "stripe-api-version",
    apiType: "stripe",
    category: "version",
    symbol: "apiVersion",
    regex: /apiVersion\s*:\s*['"]([0-9]{4}-[0-9]{2}-[0-9]{2}[^'"]*)['"]/i,
    confidence: "high",
  },
  {
    id: "stripe-invoice-payment-intent-ptr",
    apiType: "stripe",
    category: "parameter",
    symbol: "invoice.payment_intent",
    regex: /(?:invoice(?:\??\.|\s*\[\s*['"])payment_intent(?:['"]\s*\])?)/i,
    confidence: "high",
  },
  {
    id: "stripe-invoice-charge-ptr",
    apiType: "stripe",
    category: "parameter",
    symbol: "invoice.charge",
    regex: /(?:invoice(?:\??\.|\s*\[\s*['"])charge(?:['"]\s*\])?)/i,
    confidence: "high",
  },
  {
    id: "stripe-invoice-paid-ptr",
    apiType: "stripe",
    category: "parameter",
    symbol: "invoice.paid",
    regex: /(?:invoice(?:\??\.|\s*\[\s*['"])paid(?:['"]\s*\])?)/i,
    confidence: "medium",
  },
  {
    id: "stripe-charges-create",
    apiType: "stripe",
    category: "method",
    symbol: "stripe.charges.create",
    regex: /(?:stripe\.charges\.create\s*\()/i,
    confidence: "high",
  },
  {
    id: "stripe-invoices-retrieve",
    apiType: "stripe",
    category: "method",
    symbol: "stripe.invoices.retrieve",
    regex: /(?:stripe\.invoices\.retrieve\s*\()/i,
    confidence: "high",
  },

  // --- Firebase Rules ---
  {
    id: "firebase-import-namespaced",
    apiType: "firebase",
    category: "import",
    symbol: "firebase/app (namespaced)",
    regex: /(?:import\s+firebase\s+from\s+['"]firebase(?:\/app)?['"]|require\(['"]firebase['"]\))/i,
    confidence: "high",
  },
  {
    id: "firebase-auth-chain",
    apiType: "firebase",
    category: "method",
    symbol: "firebase.auth()",
    regex: /(?:firebase\.auth\(\))/i,
    confidence: "high",
  },
  {
    id: "firebase-signin-email",
    apiType: "firebase",
    category: "method",
    symbol: "signInWithEmailAndPassword",
    regex: /(?:signInWithEmailAndPassword\s*\()/i,
    confidence: "high",
  },
  {
    id: "firebase-signout",
    apiType: "firebase",
    category: "method",
    symbol: "signOut",
    regex: /(?:(?:firebase\.auth\(\)\.signOut|signOut)\s*\()/i,
    confidence: "high",
  },

  // --- OpenAI Rules ---
  {
    id: "openai-import",
    apiType: "openai",
    category: "import",
    symbol: "openai SDK Import",
    regex: /(?:import\s+openai|from\s+openai\s+import|import\s+OpenAI\s+from\s+['"]openai['"]|require\(['"]openai['"]\))/i,
    confidence: "high",
  },
  {
    id: "openai-completion-create",
    apiType: "openai",
    category: "method",
    symbol: "openai.Completion.create",
    regex: /(?:openai\.Completion\.create\s*\(|Completion\.create\s*\()/i,
    confidence: "high",
  },
  {
    id: "openai-chat-completions",
    apiType: "openai",
    category: "method",
    symbol: "chat.completions.create",
    regex: /(?:chat\.completions\.create\s*\()/i,
    confidence: "high",
  },
  {
    id: "openai-davinci-model",
    apiType: "openai",
    category: "parameter",
    symbol: "text-davinci-003",
    regex: /['"]text-davinci-00[1-3]['"]/i,
    confidence: "high",
  },
  {
    id: "openai-completion-text-accessor",
    apiType: "openai",
    category: "parameter",
    symbol: "response.choices[0].text",
    regex: /(?:choices\[0\](?:\??\.|\s*\[\s*['"])text)/i,
    confidence: "high",
  },

  // --- GitHub Rules ---
  {
    id: "github-query-token",
    apiType: "github",
    category: "parameter",
    symbol: "?access_token= URL Query Token",
    regex: /(?:[?&]access_token=)/i,
    confidence: "high",
  },
  {
    id: "github-api-endpoint",
    apiType: "github",
    category: "endpoint",
    symbol: "https://api.github.com",
    regex: /(?:https:\/\/api\.github\.com\/[a-zA-Z0-9_\/.-]+)/i,
    confidence: "high",
  },

  // --- Generic HTTP API Call Rules ---
  {
    id: "http-fetch-call",
    apiType: "http_call",
    category: "endpoint",
    symbol: "fetch() HTTP call",
    regex: /(?:fetch\s*\(\s*[`'"]https?:\/\/[^`'"]+[`'"])/i,
    confidence: "medium",
  },
  {
    id: "http-axios-call",
    apiType: "http_call",
    category: "endpoint",
    symbol: "axios HTTP call",
    regex: /(?:axios\.(?:get|post|put|delete|patch)\s*\(\s*[`'"]https?:\/\/[^`'"]+[`'"])/i,
    confidence: "medium",
  },
];

/**
 * Extracts distinct identifier tokens from arbitrary user-provided changelog text
 */
function extractChangelogTokens(changelog: string): string[] {
  const tokens = new Set<string>();

  // Extract backticked terms: `something`
  const backtickMatches = changelog.match(/`([^`]{3,40})`/g);
  if (backtickMatches) {
    for (const m of backtickMatches) {
      const clean = m.replace(/`/g, "").trim();
      if (!clean.includes(" ") && clean.length >= 3) {
        tokens.add(clean);
      }
    }
  }

  // Extract URL paths or endpoints: /v1/... or /api/...
  const endpointMatches = changelog.match(/(?:\/v[0-9]+|\/api)\/[a-zA-Z0-9_/-]+/g);
  if (endpointMatches) {
    for (const ep of endpointMatches) {
      tokens.add(ep);
    }
  }

  return Array.from(tokens);
}

export function scanFileForApiUsages(
  file: RepoFile,
  dynamicTokens: string[] = []
): ApiUsage[] {
  if (!file.content) return [];

  const lines = file.content.split("\n");
  const usages: ApiUsage[] = [];
  let usageCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const lineNumber = i + 1;
    let matchedThisLine = false;

    // Check predefined pattern rules
    for (const rule of RULES) {
      if (rule.regex.test(lineText)) {
        const startCtx = Math.max(0, i - 2);
        const endCtx = Math.min(lines.length - 1, i + 2);

        usages.push({
          id: `usage-${file.path.replace(/[^a-zA-Z0-9]/g, "_")}-${lineNumber}-${usageCounter++}`,
          file: file.path,
          line: lineNumber,
          rawCode: lineText.trim(),
          apiType: rule.apiType,
          category: rule.category,
          symbol: rule.symbol,
          confidence: rule.confidence,
          contextBefore: lines.slice(startCtx, i),
          contextAfter: lines.slice(i + 1, endCtx + 1),
        });
        matchedThisLine = true;
      }
    }

    // Check dynamic changelog tokens if not already matched
    if (!matchedThisLine && dynamicTokens.length > 0) {
      for (const token of dynamicTokens) {
        if (lineText.includes(token)) {
          const startCtx = Math.max(0, i - 2);
          const endCtx = Math.min(lines.length - 1, i + 2);

          usages.push({
            id: `usage-${file.path.replace(/[^a-zA-Z0-9]/g, "_")}-${lineNumber}-${usageCounter++}`,
            file: file.path,
            line: lineNumber,
            rawCode: lineText.trim(),
            apiType: "custom",
            category: token.startsWith("/") ? "endpoint" : "parameter",
            symbol: token,
            confidence: "medium",
            contextBefore: lines.slice(startCtx, i),
            contextAfter: lines.slice(i + 1, endCtx + 1),
          });
          break;
        }
      }
    }
  }

  return usages;
}

export function scanRepositoryFiles(
  files: RepoFile[],
  changelogText?: string
): ApiUsage[] {
  const dynamicTokens = changelogText ? extractChangelogTokens(changelogText) : [];
  const allUsages: ApiUsage[] = [];

  for (const file of files) {
    const fileUsages = scanFileForApiUsages(file, dynamicTokens);
    allUsages.push(...fileUsages);
  }

  return allUsages;
}
