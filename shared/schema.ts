import { z } from 'zod';

// --- Common Types ---

export const PrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical']);
export type Priority = z.infer<typeof PrioritySchema>;

export const StatusSchema = z.enum(['Todo', 'InProgress', 'Done', 'Blocked']);
export type Status = z.infer<typeof StatusSchema>;

// --- Test Case Management ---

export const TestStatusSchema = z.enum(['NoRun', 'Pass', 'Fail', 'Blocked']);
export type TestStatus = z.infer<typeof TestStatusSchema>;

export const TestItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  precondition: z.string().optional(),
  expectedResult: z.string().min(1),
  status: TestStatusSchema.default('NoRun'),
  evidence: z.string().optional(),
  defectId: z.string().uuid().optional(), // Link to Defect
  updatedAt: z.date(),
});
export type TestItem = z.infer<typeof TestItemSchema>;

// --- Defect Tracking ---

export const DefectStatusSchema = z.enum(['Open', 'Investigating', 'Fixed', 'Verified', 'Closed']);
export type DefectStatus = z.infer<typeof DefectStatusSchema>;

export const DefectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  priority: PrioritySchema,
  status: DefectStatusSchema.default('Open'),
  testItemId: z.string().uuid().optional(), // Link to TestItem
  assignedTo: z.string().optional(),
  updatedAt: z.date(),
});
export type Defect = z.infer<typeof DefectSchema>;

// --- Issue & Progress ---

export const IssueSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  status: StatusSchema.default('Todo'),
  priority: PrioritySchema,
  assignedTo: z.string().optional(),
  updatedAt: z.date(),
});
export type Issue = z.infer<typeof IssueSchema>;
