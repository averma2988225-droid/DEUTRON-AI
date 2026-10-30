export type ApiProviderType =
  | "stripe"
  | "firebase"
  | "github"
  | "openai"
  | "http_call"
  | "custom";

export type ApiUsageCategory =
  | "import"
  | "endpoint"
  | "method"
  | "parameter"
  | "version";

export interface ApiUsage {
  id: string;
  file: string;
  line: number;
  column?: number;
  rawCode: string;
  apiType: ApiProviderType;
  category: ApiUsageCategory;
  symbol: string;
  confidence: "high" | "medium" | "inferred";
  contextBefore?: string[];
  contextAfter?: string[];
}

export interface RepoInfo {
  owner: string;
  repo: string;
  url: string;
  description: string;
  defaultBranch: string;
  stars: number;
  language: string;
  topics?: string[];
  totalFiles: number;
}

export interface RepoFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
  content?: string;
  url?: string;
}

export interface ChangelogPreset {
  id: string;
  title: string;
  provider: ApiProviderType;
  version: string;
  tagline: string;
  changelogText: string;
  recommendedRepoUrl: string;
}

export type SeverityLevel = "critical" | "breaking" | "warning" | "info";

export interface ImpactFinding {
  id: string;
  file: string;
  line: number;
  severity: SeverityLevel;
  title: string;
  explanation: string;
  matchedUsageId?: string;
  originalSnippet: string;
  proposedSnippet: string;
  migrationAdvice: string;
  ruleCategory?: string;
}

export interface PatchVerificationCheck {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

export interface PatchResult {
  file: string;
  originalContent: string;
  patchedContent: string;
  diff: string;
  status: "verified" | "needs_review" | "failed";
  checks: PatchVerificationCheck[];
  summary: string;
}

export interface ScanStats {
  totalFiles: number;
  scannedFiles: number;
  apiUsagesCount: number;
  affectedFilesCount: number;
  criticalCount: number;
  breakingCount: number;
  warningsCount: number;
  durationMs: number;
}

export interface AgentThought {
  id: string;
  timestamp: string;
  type: "pondering" | "inspecting" | "reasoning" | "synthesizing" | "verifying";
  content: string;
}

export interface ScanReport {
  id: string;
  repo: RepoInfo;
  changelogText: string;
  createdAt: string;
  status: "in_progress" | "completed" | "failed";
  currentStep: ScanStepKey;
  stepMessage: string;
  progressPercent: number;
  thoughts: AgentThought[];
  stats: ScanStats;
  detectedUsages: ApiUsage[];
  findings: ImpactFinding[];
  patches: PatchResult[];
  verificationPassed: boolean;
  error?: string;
}

export type ScanStepKey =
  | "connecting"
  | "indexing"
  | "detecting"
  | "analyzing"
  | "patching"
  | "verifying"
  | "completed";
