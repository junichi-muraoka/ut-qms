export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TestStatus = 'NoRun' | 'Pass' | 'Fail' | 'Blocked';
export type DefectStatus = 'Open' | 'Investigating' | 'Fixed' | 'Verified' | 'Closed';
export type IssueStatus = 'Todo' | 'InProgress' | 'Done';

export interface TestItem {
  id: string;
  title: string;
  precondition: string;
  expectedResult: string;
  status: TestStatus;
  updatedAt: string;
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: DefectStatus;
  testItemId: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: IssueStatus;
}

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
