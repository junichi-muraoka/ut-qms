import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const testItems = sqliteTable('test_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  precondition: text('precondition'),
  expectedResult: text('expected_result').notNull(),
  status: text('status').notNull().default('NoRun'), // NoRun, Pass, Fail, Blocked
  evidence: text('evidence'),
  defectId: text('defect_id'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const defects = sqliteTable('defects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull(), // Low, Medium, High, Critical
  status: text('status').notNull().default('Open'), // Open, Investigating, Fixed, Verified, Closed
  testItemId: text('test_item_id'),
  assignedTo: text('assigned_to'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Todo'), // Todo, InProgress, Done, Blocked
  priority: text('priority').notNull(),
  assignedTo: text('assigned_to'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
