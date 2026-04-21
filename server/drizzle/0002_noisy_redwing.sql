CREATE TABLE `deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`system_id` text,
	`milestone_id` text,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`status` text DEFAULT 'Pending' NOT NULL,
	`approval_status` text DEFAULT 'Draft',
	`due_date` integer,
	`document_id` text,
	`external_url` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quality_verdicts` (
	`id` text PRIMARY KEY NOT NULL,
	`system_id` text,
	`verdict_text` text NOT NULL,
	`author` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `systems` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pm_name` text,
	`color` text DEFAULT '#3b82f6',
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `defects` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `documents` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `issues` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `milestones` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `milestones` ADD `depends_on_milestone_id` text;--> statement-breakpoint
ALTER TABLE `milestones` ADD `category` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `risks` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `test_items` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `system_id` text REFERENCES systems(id);--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `risk_level` text DEFAULT 'Success';