export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TestStatus = 'NoRun' | 'Pass' | 'Fail' | 'Blocked';
export type DefectStatus = 'Open' | 'Investigating' | 'Fixed' | 'Verified' | 'Closed';
export type IssueStatus = 'Todo' | 'InProgress' | 'Done';

export interface TestItem {
  id: string;
  systemId?: string;
  title: string;
  precondition: string;
  expectedResult: string;
  status: TestStatus;
  milestoneId?: string;
  updatedAt: string;
}

export interface Defect {
  id: string;
  systemId?: string;
  title: string;
  description: string;
  priority: Priority;
  status: DefectStatus;
  testItemId: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  systemId?: string;
  title: string;
  description: string;
  priority: Priority;
  status: IssueStatus;
  startDate?: string;
  dueDate?: string;
  milestoneId?: string;
}

// --- Wiki & Documents ---

export type DocumentCategory = 'Proposal' | 'MeetingMinutes' | 'Rule' | 'Manual' | 'Other';

export interface Document {
  id: string;
  title: string;
  content?: string;
  category: DocumentCategory;
  createdBy?: string;
  updatedAt: string;
}

// --- Milestones & Deliverables ---

export type MilestoneStatus = 'Planning' | 'Active' | 'Completed' | 'Delayed';

export interface Milestone {
  id: string;
  systemId?: string;
  name: string;
  description?: string;
  startDate: string;
  dueDate: string;
  criteria?: string;
  status: MilestoneStatus;
  category?: string;
  dependsOnMilestoneId?: string;
  updatedAt: string;
}

export type DeliverableStatus = 'Pending' | 'Submitted' | 'Approved';

export interface Deliverable {
  id: string;
  milestoneId: string;
  name: string;
  description?: string;
  status: DeliverableStatus;
  category?: string;
  approvalStatus?: string;
  dueDate?: string;
  documentId?: string;
  externalUrl?: string;
  updatedAt: string;
}

// --- Reviews ---

export type ReviewStatus = 'Todo' | 'InReview' | 'Fixed' | 'Closed';

export interface Review {
  id: string;
  title: string;
  targetDate: string;
  reviewers?: string;
  summary?: string;
  status: ReviewStatus;
  updatedAt: string;
}

export type ReviewItemStatus = 'Open' | 'Fixed' | 'Closed';

export interface ReviewItem {
  id: string;
  reviewId: string;
  content: string;
  severity: 'Low' | 'Medium' | 'High';
  category?: string;
  assignedTo?: string;
  status: ReviewItemStatus;
  defectId?: string;
  updatedAt: string;
}

// --- Stats & Trends ---

export interface Stats {
  totalTests: number;
  testPassRate: number;
  openDefects: number;
  progress: number;
}

export interface ProgressTrendItem {
  date: string;
  remaining: number;
  ideal: number;
}

export interface QualityTrendItem {
  date: string;
  defects: number;
  passRate: number;
}

export interface TrendData {
  progressTrend: ProgressTrendItem[];
  qualityTrend: QualityTrendItem[];
}

// --- Reports ---

export interface QualitySummary {
  totalTests: number;
  passedTests: number;
  totalDefects: number;
  closedDefects: number;
  defectDensity: string;
  defectTypeDist: Record<string, number>;
  causeDist: Record<string, number>;
  updatedAt: string;
}
