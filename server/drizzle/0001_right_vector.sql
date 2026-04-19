CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`target_id` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`file_name` text,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`category` text,
	`created_by` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`due_date` integer NOT NULL,
	`criteria` text,
	`status` text DEFAULT 'Planning' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_items` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`content` text NOT NULL,
	`severity` text NOT NULL,
	`category` text,
	`assigned_to` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`defect_id` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`defect_id`) REFERENCES `defects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`target_date` integer NOT NULL,
	`reviewers` text,
	`summary` text,
	`status` text DEFAULT 'Todo' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `risks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`mitigation` text,
	`priority` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`week_number` integer NOT NULL,
	`start_date` integer NOT NULL,
	`achievements` text,
	`pending_issues` text,
	`next_steps` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_defects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`test_item_id` text,
	`defect_type` text,
	`cause_category` text,
	`root_cause` text,
	`improvement` text,
	`assigned_to` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`test_item_id`) REFERENCES `test_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_defects`("id", "title", "description", "priority", "status", "test_item_id", "defect_type", "cause_category", "root_cause", "improvement", "assigned_to", "updated_at") SELECT "id", "title", "description", "priority", "status", "test_item_id", "defect_type", "cause_category", "root_cause", "improvement", "assigned_to", "updated_at" FROM `defects`;--> statement-breakpoint
DROP TABLE `defects`;--> statement-breakpoint
ALTER TABLE `__new_defects` RENAME TO `defects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `test_items` ADD `parent_id` text;--> statement-breakpoint
ALTER TABLE `test_items` ADD `milestone_id` text REFERENCES milestones(id);--> statement-breakpoint
ALTER TABLE `test_items` ADD `module_name` text;--> statement-breakpoint
ALTER TABLE `test_items` ADD `estimated_hours` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `test_items` ADD `actual_hours` real DEFAULT 0 NOT NULL;