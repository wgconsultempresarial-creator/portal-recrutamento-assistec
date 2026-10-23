CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`city` text NOT NULL,
	`role` text NOT NULL,
	`unit` text NOT NULL,
	`experience` text NOT NULL,
	`skills` text NOT NULL,
	`availability` text NOT NULL,
	`status` text DEFAULT 'Novo' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`consent_at` text NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `submission_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
