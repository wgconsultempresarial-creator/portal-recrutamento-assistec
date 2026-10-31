ALTER TABLE `maintenance_reports` ADD `snapshot` text;
--> statement-breakpoint
ALTER TABLE `maintenance_reports` ADD `pdf_base64` text;
--> statement-breakpoint
ALTER TABLE `maintenance_reports` ADD `pdf_sha256` text;
--> statement-breakpoint
CREATE TABLE `maintenance_signatures` (
 `id` text PRIMARY KEY NOT NULL,
 `branch` text NOT NULL,
 `image` text NOT NULL,
 `authorized_by` text NOT NULL,
 `authorized_at` text NOT NULL,
 `revoked_by` text,
 `revoked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_signatures_one_active` ON `maintenance_signatures` (`branch`) WHERE `revoked_at` IS NULL;
