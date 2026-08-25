CREATE TABLE `kv_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `module_data` (
	`module_instance_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`data` text,
	`last_fetched_at` text,
	`last_error_at` text,
	`last_error_message` text,
	`consecutive_errors` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`module_instance_id`) REFERENCES `module_instances`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `module_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`tab_id` text NOT NULL,
	`module_type_id` text NOT NULL,
	`position` integer NOT NULL,
	`config` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tab_id`) REFERENCES `tabs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `oauth_tokens` (
	`provider` text PRIMARY KEY NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`scope` text
);
--> statement-breakpoint
CREATE TABLE `tabs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` text NOT NULL
);
