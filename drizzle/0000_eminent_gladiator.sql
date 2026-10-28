CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`date` text NOT NULL,
	`hour` integer NOT NULL,
	`kind` text DEFAULT 'booking' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`student_id` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`guest_hash` text DEFAULT '' NOT NULL,
	`receipt_hash` text,
	`request_id` text NOT NULL,
	`key_status` text DEFAULT 'uncollected' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `active_room_slot` ON `reservations` (`room`,`date`,`hour`) WHERE "reservations"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX `request_once` ON `reservations` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `receipt_once` ON `reservations` (`receipt_hash`);--> statement-breakpoint
CREATE INDEX `guest_records` ON `reservations` (`guest_hash`,`date`);--> statement-breakpoint
CREATE INDEX `admin_dates` ON `reservations` (`date`);