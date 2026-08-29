-- AlterTable
ALTER TABLE `users` ADD COLUMN `reset_token_expires_at` DATETIME(3) NULL,
    ADD COLUMN `reset_token_hash` VARCHAR(191) NULL;
