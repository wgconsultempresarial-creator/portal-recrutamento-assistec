CREATE TABLE `maintenance_reports` (
  `id` text PRIMARY KEY NOT NULL,
  `branch` text NOT NULL,
  `company` text NOT NULL,
  `plate` text NOT NULL,
  `date` text NOT NULL,
  `services` text NOT NULL,
  `signature_mode` text NOT NULL,
  `status` text DEFAULT 'Rascunho' NOT NULL,
  `created_at` text NOT NULL,
  `created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `maintenance_reports_created_at` ON `maintenance_reports` (`created_at`);
