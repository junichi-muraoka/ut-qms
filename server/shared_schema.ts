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
  title: z.string().min(1),
  description: z.string().optional(),
  precondition: z.string().optional(),
  expectedResult: z.string().min(1),
  status: testStatusSchema.default('NoRun'),
  evidence: z.string().optional(),
  defectId: z.string().uuid().optional(), // Link to Defect
  updatedAt: z.date(),
});
export type TestItem = z.infer<typeof testItemSchema>;

// --- Defect Tracking ---

export const defectStatusSchema = z.enum(['Open', 'Investigating', 'Fixed', 'Verified', 'Closed']);
export type DefectStatus = z.infer<typeof defectStatusSchema>;

export const defectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  priority: prioritySchema,
  status: defectStatusSchema.default('Open'),
  testItemId: z.string().uuid().optional(), // Link to TestItem
  assignedTo: z.string().optional(),
  updatedAt: z.date(),
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
  updatedAt: z.date(),
});
export type Issue = z.infer<typeof issueSchema>;
