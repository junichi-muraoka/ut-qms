CREATE TABLE `defects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`test_item_id` text,
	`assigned_to` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'Todo' NOT NULL,
	`priority` text NOT NULL,
	`assigned_to` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `test_items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`precondition` text,
	`expected_result` text NOT NULL,
	`status` text DEFAULT 'NoRun' NOT NULL,
	`evidence` text,
	`defect_id` text,
	`updated_at` integer NOT NULL
);
