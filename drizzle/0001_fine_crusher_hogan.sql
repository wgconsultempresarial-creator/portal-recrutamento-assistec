CREATE TABLE `recruitment_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`questions` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`role` text NOT NULL,
	`unit` text NOT NULL,
	`description` text NOT NULL,
	`requirements` text NOT NULL,
	`contract` text NOT NULL,
	`schedule` text NOT NULL,
	`openings` integer NOT NULL,
	`closes_at` text,
	`form_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `candidates` ADD `job_id` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `form_id` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `job_title` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `answers` text DEFAULT '[]' NOT NULL;