import { RepoInfo, RepoFile } from "@/types";

export interface ParsedRepo {
  owner: string;
  repo: string;
}

export function parseGithubUrl(rawUrl: string): ParsedRepo | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const cleaned = rawUrl.trim().replace(/\/+$/, "");

  // Match https://github.com/owner/repo or github.com/owner/repo
  const webMatch = cleaned.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i
  );
  if (webMatch) {
    return { owner: webMatch[1], repo: webMatch[2].replace(/\.git$/i, "") };
  }

  // Match shorthand owner/repo
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/i, "") };
  }

  return null;
}

// Built-in Demo Repositories with realistic code bases for instant evaluation
const DEMO_REPOSITORIES: Record<
  string,
  { info: RepoInfo; files: Record<string, string> }
> = {
  "saas-billing-service": {
    info: {
      owner: "patchpilot-demo",
      repo: "saas-billing-service",
      url: "https://github.com/patchpilot-demo/saas-billing-service",
      description:
        "Microservice handling customer invoicing, subscriptions, and webhooks via Stripe",
      defaultBranch: "main",
      stars: 142,
      language: "TypeScript",
      topics: ["billing", "stripe", "payments", "microservices"],
      totalFiles: 4,
    },
    files: {
      "src/adapters/stripeInvoice.ts": `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
});

export interface NormalizedInvoice {
  id: string;
  customer: string;
  amountDue: number;
  paymentIntentId: string | null;
  chargeId: string | null;
  isPaid: boolean;
}

/**
 * Normalizes incoming Stripe invoice object for internal ERP sync.
 * Reads direct payment intent and charge pointer fields.
 */
export function normalizeInvoice(invoice: Stripe.Invoice): NormalizedInvoice {
  return {
    id: invoice.id,
    customer: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id,
    amountDue: invoice.amount_due,
    paymentIntentId: invoice.payment_intent ? String(invoice.payment_intent) : null,
    chargeId: invoice.charge ? String(invoice.charge) : null,
    isPaid: Boolean(invoice.paid),
  };
}

export async function fetchAndSyncInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const normalized = normalizeInvoice(invoice);
  console.log('Synchronized invoice:', normalized.id, 'with payment:', normalized.paymentIntentId);
  return normalized;
}
`,
      "src/services/chargeService.ts": `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
});

export async function processManualCharge(customerId: string, amountCents: number) {
  // Legacy charges.create API usage
  const charge = await stripe.charges.create({
    amount: amountCents,
    currency: 'usd',
    customer: customerId,
    description: 'Manual adjustment fee',
  });

  return {
    chargeId: charge.id,
    paid: charge.paid,
    status: charge.status,
  };
}
`,
      "src/handlers/webhookHandler.ts": `import { Request, Response } from 'express';
import Stripe from 'stripe';
import { normalizeInvoice } from '../adapters/stripeInvoice';

export async function handleStripeWebhook(req: Request, res: Response) {
  const event = req.body as Stripe.Event;

  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const normalized = normalizeInvoice(invoice);
    
    if (normalized.isPaid && normalized.paymentIntentId) {
      console.log(\`Recorded payment intent \${normalized.paymentIntentId} for \${normalized.id}\`);
    }
  }

  res.status(200).json({ received: true });
}
`,
      "package.json": `{
  "name": "saas-billing-service",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.19.2",
    "stripe": "^8.222.0"
  }
}
`,
    },
  },

  "firebase-auth-portal": {
    info: {
      owner: "patchpilot-demo",
      repo: "firebase-auth-portal",
      url: "https://github.com/patchpilot-demo/firebase-auth-portal",
      description: "User portal authentication library using Firebase Auth SDK",
      defaultBranch: "main",
      stars: 87,
      language: "JavaScript",
      topics: ["firebase", "auth", "login"],
      totalFiles: 3,
    },
    files: {
      "src/auth/authManager.js": `import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export async function loginUser(email, password) {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token };
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

export async function logoutUser() {
  await firebase.auth().signOut();
}
`,
      "src/auth/session.js": `import firebase from 'firebase/app';

export function onAuthChanged(callback) {
  return firebase.auth().onAuthStateChanged((user) => {
    callback(user);
  });
}
`,
      "package.json": `{
  "name": "firebase-auth-portal",
  "version": "1.0.0",
  "dependencies": {
    "firebase": "^8.10.1"
  }
}
`,
    },
  },

  "ai-knowledge-agent": {
    info: {
      owner: "patchpilot-demo",
      repo: "ai-knowledge-agent",
      url: "https://github.com/patchpilot-demo/ai-knowledge-agent",
      description: "Automated summarization and Q&A engine using OpenAI completions",
      defaultBranch: "main",
      stars: 215,
      language: "Python",
      topics: ["openai", "ai", "summarizer"],
      totalFiles: 2,
    },
    files: {
      "services/summarizer.py": `import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_summary(document_text: str) -> str:
    prompt = f"Summarize the following text in 3 bullet points:\\n\\n{document_text}\\n\\nSummary:"
    
    # Deprecated Completion.create endpoint
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        max_tokens=256,
        temperature=0.3,
    )
    
    return response.choices[0].text.strip()

def process_batch(docs: list[str]) -> list[str]:
    return [generate_summary(doc) for doc in docs]
`,
      "requirements.txt": `openai==0.28.1
requests>=2.31.0
python-dotenv>=1.0.0
`,
    },
  },

  "github-webhook-orchestrator": {
    info: {
      owner: "patchpilot-demo",
      repo: "github-webhook-orchestrator",
      url: "https://github.com/patchpilot-demo/github-webhook-orchestrator",
      description: "Dispatch and verify automated triage actions on GitHub repositories",
      defaultBranch: "main",
      stars: 64,
      language: "JavaScript",
      topics: ["github-api", "webhooks", "automation"],
      totalFiles: 2,
    },
    files: {
      "src/client/githubApi.js": `const axios = require('axios');

async function fetchIssueComments(owner, repo, issueNumber, token) {
  // Legacy deprecated query token pattern
  const url = \`https://api.github.com/repos/\${owner}/\${repo}/issues/\${issueNumber}/comments?access_token=\${token}\`;
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Webhook-Orchestrator'
    }
  });
  
  return response.data;
}

module.exports = { fetchIssueComments };
`,
      "package.json": `{
  "name": "github-webhook-orchestrator",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.6.0"
  }
}
`,
    },
  },
};

/**
 * Intelligent scoring function to rank repository files so critical
 * API integrations, routes, and manifests are inspected first.
 */
function scoreFileRelevance(path: string): number {
  const p = path.toLowerCase();
  let score = 0;

  // Root manifests get top priority to discover declared dependencies
  if (
    p === "package.json" ||
    p === "requirements.txt" ||
    p === "pyproject.toml" ||
    p === "go.mod" ||
    p === "gemfile"
  ) {
    return 200;
  }

  // High-value API / integration keywords in path
  const apiKeywords = [
    "stripe",
    "firebase",
    "openai",
    "github",
    "octokit",
    "auth",
    "payment",
    "billing",
    "checkout",
    "webhook",
    "chat_completions",
    "completions",
    "assistants",
    "api",
    "service",
    "client",
    "adapter",
    "handler",
    "controller",
    "route",
    "fetch",
    "axios",
  ];

  for (const kw of apiKeywords) {
    if (p.includes(kw)) score += 35;
  }

  // Directory structure priority
  if (
    p.startsWith("src/") ||
    p.startsWith("lib/") ||
    p.startsWith("services/") ||
    p.startsWith("api/") ||
    p.startsWith("app/")
  ) {
    score += 20;
  }

  // Deprioritize test fixtures, minified files, lockfiles
  if (
    p.includes("test") ||
    p.includes("spec") ||
    p.endsWith(".min.js") ||
    p.includes("__tests__") ||
    p.includes(".github/")
  ) {
    score -= 50;
  }

  return score;
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoInfo> {
  // Check demo repositories first
  if (DEMO_REPOSITORIES[repo]) {
    return DEMO_REPOSITORIES[repo].info;
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "PatchPilot-Agent/1.0",
    };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        owner: data.owner?.login || owner,
        repo: data.name || repo,
        url: data.html_url || `https://github.com/${owner}/${repo}`,
        description: data.description || `Public repository ${owner}/${repo}`,
        defaultBranch: data.default_branch || "main",
        stars: data.stargazers_count ?? 0,
        language: data.language || "TypeScript",
        topics: data.topics || [],
        totalFiles: 0,
      };
    }
  } catch (err) {
    console.warn("GitHub API metadata fetch failed, using fallback:", err);
  }

  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    description: `Public repository ${owner}/${repo}`,
    defaultBranch: "main",
    stars: 0,
    language: "Codebase",
    topics: ["api", "integration"],
    totalFiles: 0,
  };
}

export async function fetchRepoTreeAndContents(
  owner: string,
  repo: string,
  branch = "main"
): Promise<{ info: RepoInfo; files: RepoFile[] }> {
  // Check demo repositories
  if (DEMO_REPOSITORIES[repo]) {
    const demo = DEMO_REPOSITORIES[repo];
    const fileEntries: RepoFile[] = Object.entries(demo.files).map(
      ([path, content]) => ({
        path,
        type: "blob",
        size: content.length,
        content,
      })
    );
    return {
      info: { ...demo.info, totalFiles: fileEntries.length },
      files: fileEntries,
    };
  }

  const info = await fetchRepoMetadata(owner, repo);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "PatchPilot-Agent/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Try candidate branches: user-specified, then metadata default branch, then main, then master
  const branchCandidates = Array.from(
    new Set([branch, info.defaultBranch, "main", "master"].filter(Boolean))
  );

  let treeData: any = null;
  let activeBranch = info.defaultBranch || "main";

  for (const b of branchCandidates) {
    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${b}?recursive=1`,
        { headers }
      );
      if (treeRes.ok) {
        treeData = await treeRes.json();
        activeBranch = b;
        info.defaultBranch = b;
        break;
      }
    } catch {
      // try next branch candidate
    }
  }

  if (treeData && Array.isArray(treeData.tree)) {
    const rawTree = treeData.tree as Array<{
      path: string;
      type: string;
      size?: number;
    }>;

    const totalBlobs = rawTree.filter((item) => item.type === "blob").length;

    // Filter only code files
    const codeExtensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".py",
      ".go",
      ".rb",
      ".php",
      ".java",
      ".cs",
      ".json",
      ".rs",
    ];
    const ignoredPaths = [
      "node_modules/",
      ".git/",
      "dist/",
      "build/",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
    ];

    const candidates = rawTree.filter((item) => {
      if (item.type !== "blob") return false;
      if (ignoredPaths.some((ignored) => item.path.includes(ignored)))
        return false;
      if (item.size && item.size > 200000) return false; // skip huge generated bundles
      return codeExtensions.some((ext) => item.path.endsWith(ext));
    });

    // Score and select the top 20 most relevant files
    const prioritized = candidates
      .sort((a, b) => scoreFileRelevance(b.path) - scoreFileRelevance(a.path))
      .slice(0, 20);

    const files: RepoFile[] = [];

    // Fetch file contents concurrently via raw.githubusercontent.com
    await Promise.allSettled(
      prioritized.map(async (item) => {
        try {
          const rawRes = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${activeBranch}/${item.path}`
          );
          if (rawRes.ok) {
            const content = await rawRes.text();
            files.push({
              path: item.path,
              type: "blob",
              size: item.size || content.length,
              content,
            });
          }
        } catch {
          // continue
        }
      })
    );

    return {
      info: {
        ...info,
        totalFiles: totalBlobs > 0 ? totalBlobs : files.length,
      },
      files,
    };
  }

  // If live GitHub rate limit occurred or network is blocked, fallback to demo billing service
  const fallback = DEMO_REPOSITORIES["saas-billing-service"];
  return {
    info: { ...fallback.info, totalFiles: Object.keys(fallback.files).length },
    files: Object.entries(fallback.files).map(([path, content]) => ({
      path,
      type: "blob",
      size: content.length,
      content,
    })),
  };
}
