import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 0. プログラム/システム管理 (Multi-System Foundation)
export const systems = sqliteTable('systems', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  pmName: text('pm_name'),
  color: text('color').default('#3b82f6'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 1. マイルストーン・フェーズ管理
export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  name: text('name').notNull(),
  description: text('description'),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  criteria: text('criteria'), // 達成基準（パス率目標など）
  status: text('status').notNull().default('Planning'), // Planning, Active, Completed, Delayed
  dependsOnMilestoneId: text('depends_on_milestone_id'),
  category: text('category'), // Requirements, BasicDesign, DetailDesign, Build, UT, IT-A, IT-B, ST-F, PerfLoad, SecRecov, OperMig, UAT, Cutover
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 2. テスト項目 / WBS (親子階層構造)
export const testItems = sqliteTable('test_items', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  parentId: text('parent_id'), // 自己参照 (WBS階層用)
  milestoneId: text('milestone_id').references(() => milestones.id),
  moduleName: text('module_name'), // 機能分類 (密度計算用)
  title: text('title').notNull(),
  description: text('description'),
  precondition: text('precondition'),
  expectedResult: text('expected_result').notNull(),
  status: text('status').notNull().default('NoRun'), // NoRun, Pass, Fail, Blocked
  estimatedHours: real('estimated_hours').notNull().default(0), // 予定工数
  actualHours: real('actual_hours').notNull().default(0),    // 実績工数
  evidence: text('evidence'), // 後方互換性用（将来的にattachmentsへ移行）
  defectId: text('defect_id'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 3. 不具合記録 & 分析
export const defects = sqliteTable('defects', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull(), // Low, Medium, High, Critical
  status: text('status').notNull().default('Open'), // Open, Investigating, Fixed, Verified, Closed
  testItemId: text('test_item_id').references(() => testItems.id),
  defectType: text('defect_type'), // Bug, Requirement, Design, Environment
  causeCategory: text('cause_category'), // Logic, UI/UX, Data, Spec
  rootCause: text('root_cause'), // 根本原因テキスト
  improvement: text('improvement'), // 再発防止策
  assignedTo: text('assigned_to'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 4. 証跡 (マルチエビデンス)
export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  targetId: text('target_id').notNull(), // test_item or defect ID
  type: text('type').notNull(), // image, log, link, file
  url: text('url').notNull(),
  fileName: text('file_name'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 5. レビュー記録
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  title: text('title').notNull(),
  targetDate: integer('target_date', { mode: 'timestamp' }).notNull(),
  reviewers: text('reviewers'), // カンマ区切りまたはJSON
  summary: text('summary'),
  status: text('status').notNull().default('Todo'), // Todo, InReview, Fixed, Closed
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const reviewItems = sqliteTable('review_items', {
  id: text('id').primaryKey(),
  reviewId: text('review_id').notNull().references(() => reviews.id),
  content: text('content').notNull(),
  severity: text('severity').notNull(), // Low, Medium, High
  category: text('category'), // Logic, UI/UX, Maintenance, Doc
  assignedTo: text('assigned_to'),
  status: text('status').notNull().default('Open'),
  defectId: text('defect_id').references(() => defects.id), // 不具合への変換用
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 6. 週次報告 & リスク管理
export const weeklyReports = sqliteTable('weekly_reports', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  weekNumber: integer('week_number').notNull(), // 週番号または開始日
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  achievements: text('achievements'), // 達成事項
  pendingIssues: text('pending_issues'), // 懸案事項
  nextSteps: text('next_steps'), // 次週予定
  riskLevel: text('risk_level').default('Success'), // Success, Warning, Critical
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const risks = sqliteTable('risks', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  title: text('title').notNull(),
  description: text('description'),
  mitigation: text('mitigation'), // 対策
  priority: text('priority').notNull(), // Low, Medium, High
  status: text('status').notNull().default('Open'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 7. Wiki / ドキュメント管理
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  title: text('title').notNull(),
  content: text('content'),
  category: text('category'), // Proposal, MeetingMinutes, Rule, Manual
  createdBy: text('created_by'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 8. マイルストーン成果物
export const deliverables = sqliteTable('deliverables', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id), // Direct link for global view
  milestoneId: text('milestone_id').references(() => milestones.id),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // DesignDoc, ReviewRecord, Evidence, etc.
  status: text('status').notNull().default('Pending'), // Pending, Submitted, Approved
  approvalStatus: text('approval_status').default('Draft'), // Draft, Reviewing, Approved, Rejected
  dueDate: integer('due_date', { mode: 'timestamp' }), // Specific deadline for the artifact
  documentId: text('document_id').references(() => documents.id),
  externalUrl: text('external_url'), // GitHub PR, SharePoint link, etc.
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 既存の課題管理 (プロジェクト管理用)
export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Todo'), // Todo, InProgress, Done, Blocked
  priority: text('priority').notNull(),
  assignedTo: text('assigned_to'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const qualityVerdicts = sqliteTable('quality_verdicts', {
  id: text('id').primaryKey(),
  systemId: text('system_id').references(() => systems.id),
  verdictText: text('verdict_text').notNull(),
  author: text('author'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
