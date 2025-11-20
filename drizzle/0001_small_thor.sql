CREATE TABLE `searchFolders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`path` text NOT NULL,
	`description` text,
	`addedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searchFolders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `searchFolders` ADD CONSTRAINT `searchFolders_addedBy_users_id_fk` FOREIGN KEY (`addedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;