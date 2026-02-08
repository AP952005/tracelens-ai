export type CaseStatus = 'scanning' | 'analyzing' | 'closed' | 'archived' | 'complete';

export type InvestigationType = 'email' | 'username' | 'phone' | 'ip' | 'domain' | 'wallet';

export interface SocialProfile {
  platform: string;
  username: string;
  url: string;
  profileUrl?: string;
  confidence: number; // 0-100
  notes: string;
  avatarUrl?: string;
  lastActive?: string;
}

export interface BreachRecord {
  domain: string;
  date: string;
  dataClasses: string[];
  dataTypes?: string[]; // Alias for dataClasses for UI compatibility
  verified: boolean;
  description: string;
  riskScore: number;
}

export interface EvidenceNode {
  id: string;
  type: 'person' | 'account' | 'ip' | 'device' | 'location' | 'document';
  label: string;
  data: Record<string, any>;
  source: string; // e.g., "OSINT Scan", "Manual Entry"
  timestamp: string;
  hash: string; // SHA-256 for chain of custody
}

export interface EvidenceEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence: number;
}

export interface ChainOfCustodyEvent {
  id: string;
  timestamp: string;
  action: 'collected' | 'analyzed' | 'archived' | 'viewed';
  actor: string; // "System" or "Agent X"
  details: string;
  hashBefore?: string;
  hashAfter: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  source: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReportSection {
  title: string;
  content: string; // HTML or Markdown
  type: 'summary' | 'details' | 'recommendation' | 'technical';
}

export interface InvestigationReport {
  id: string; // usually same as caseId
  caseId: string;
  generatedAt: string;
  title: string;
  summary: string;
  sections: ReportSection[];
  classificationLevel: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
}

export interface InvestigationCase {
  id: string;
  created: string; // ISO Date
  updated: string; // ISO Date
  status: CaseStatus;
  query: string;
  queryType: InvestigationType;
  threatScore: number; // 0-100
  socialProfiles: SocialProfile[];
  breaches: BreachRecord[];
  evidenceGraph: {
    nodes: EvidenceNode[];
    edges: EvidenceEdge[];
  };
  timeline: TimelineEvent[];
  chainOfCustody: ChainOfCustodyEvent[];
  report?: InvestigationReport;
  tags: string[];
}
