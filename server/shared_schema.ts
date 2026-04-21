import { z } from 'zod';

export const prioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical']);
export type Priority = z.infer<typeof prioritySchema>;

export const statusSchema = z.enum(['Todo', 'InProgress', 'Done', 'Blocked']);
export type Status = z.infer<typeof statusSchema>;

// --- Test Case Management ---

export const testStatusSchema = z.enum(['NoRun', 'Pass', 'Fail', 'Blocked']);
export type TestStatus = z.infer<typeof testStatusSchema>;

export const testItemSchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(), // WBS
  milestoneId: z.string().uuid().optional(),
  moduleName: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  precondition: z.string().optional(),
  expectedResult: z.string().min(1),
  status: testStatusSchema.default('NoRun'),
  estimatedHours: z.number().default(0),
  actualHours: z.number().default(0),
  evidence: z.string().optional(),
  defectId: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
});
export type TestItem = z.infer<typeof testItemSchema>;

// --- Defect Tracking ---

export const defectStatusSchema = z.enum(['Open', 'Investigating', 'Fixed', 'Verified', 'Closed']);
export type DefectStatus = z.infer<typeof defectStatusSchema>;

export const systemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  pmName: z.string().optional(),
  color: z.string().default('#3b82f6'),
});
export type System = z.infer<typeof systemSchema>;

export const defectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  priority: prioritySchema,
  status: defectStatusSchema.default('Open'),
  testItemId: z.string().uuid().optional(),
  defectType: z.string().optional(),
  causeCategory: z.string().optional(),
  rootCause: z.string().optional(),
  improvement: z.string().optional(),
  assignedTo: z.string().optional(),
  updatedAt: z.coerce.date(),
});
export type Defect = z.infer<typeof defectSchema>;

// --- Issue & Progress ---

export const issueSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  status: statusSchema.default('Todo'),
  priority: prioritySchema,
  assignedTo: z.string().optional(),
  updatedAt: z.coerce.date(),
});
export type Issue = z.infer<typeof issueSchema>;

// --- Wiki & Documents ---

export const documentCategorySchema = z.enum(['Proposal', 'MeetingMinutes', 'Rule', 'Manual', 'Other']);
export type DocumentCategory = z.infer<typeof documentCategorySchema>;

export const documentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().optional(),
  category: documentCategorySchema.default('Other'),
  createdBy: z.string().optional(),
  updatedAt: z.coerce.date(),
});
export type Document = z.infer<typeof documentSchema>;

// --- Milestones & Deliverables ---

export const milestoneStatusSchema = z.enum(['Planning', 'Active', 'Completed', 'Delayed']);
export type MilestoneStatus = z.infer<typeof milestoneStatusSchema>;

export const milestoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  criteria: z.string().optional(),
  status: milestoneStatusSchema.default('Planning'),
  updatedAt: z.coerce.date(),
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const deliverableStatusSchema = z.enum(['Pending', 'Submitted', 'Approved']);
export type DeliverableStatus = z.infer<typeof deliverableStatusSchema>;

export const deliverableSchema = z.object({
  id: z.string().uuid(),
  systemId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: deliverableStatusSchema.default('Pending'),
  approvalStatus: z.string().default('Draft'),
  dueDate: z.coerce.date().optional().nullable(),
  documentId: z.string().uuid().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  updatedAt: z.coerce.date(),
});
export type Deliverable = z.infer<typeof deliverableSchema>;

// --- Reviews ---

export const reviewStatusSchema = z.enum(['Todo', 'InReview', 'Fixed', 'Closed']);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const reviewSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  targetDate: z.coerce.date(),
  reviewers: z.string().optional(),
  summary: z.string().optional(),
  status: reviewStatusSchema.default('Todo'),
  updatedAt: z.coerce.date(),
});
export type Review = z.infer<typeof reviewSchema>;

export const reviewItemStatusSchema = z.enum(['Open', 'Fixed', 'Closed']);
export type ReviewItemStatus = z.infer<typeof reviewItemStatusSchema>;

export const qualityVerdictSchema = z.object({
  id: z.string().uuid(),
  verdictText: z.string(),
  author: z.string().optional(),
});

export const reviewItemSchema = z.object({
  id: z.string().uuid(),
  reviewId: z.string().uuid(),
  content: z.string().min(1),
  severity: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  category: z.string().optional(),
  assignedTo: z.string().optional(),
  status: reviewItemStatusSchema.default('Open'),
  defectId: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
});
export type ReviewItem = z.infer<typeof reviewItemSchema>;

export const weeklyReportSchema = z.object({
  id: z.string().uuid(),
  systemId: z.string().uuid(),
  weekNumber: z.number(),
  startDate: z.coerce.date(),
  achievements: z.string().optional().nullable(),
  pendingIssues: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
  riskLevel: z.string().default('Success'),
  updatedAt: z.coerce.date(),
});
export type WeeklyReport = z.infer<typeof weeklyReportSchema>;
