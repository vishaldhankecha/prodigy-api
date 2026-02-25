-- DropForeignKey
ALTER TABLE `Activity` DROP FOREIGN KEY `Activity_dayPlanId_fkey`;

-- DropForeignKey
ALTER TABLE `ActivityProgress` DROP FOREIGN KEY `ActivityProgress_activityId_fkey`;

-- DropForeignKey
ALTER TABLE `ActivityProgress` DROP FOREIGN KEY `ActivityProgress_userId_fkey`;

-- DropIndex
DROP INDEX `Activity_dayPlanId_idx` ON `Activity`;

-- DropIndex
DROP INDEX `ActivityProgress_activityId_idx` ON `ActivityProgress`;

-- DropIndex
DROP INDEX `ActivityProgress_userId_activityId_key` ON `ActivityProgress`;

-- AlterTable
ALTER TABLE `Activity` DROP COLUMN `dayPlanId`,
    DROP COLUMN `durationMinutes`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `defaultOccurrences` INTEGER NOT NULL,
    ADD COLUMN `frequency` ENUM('MAXIMIZE', 'DAILY_1X', 'DAILY_2X', 'DAILY_3X', 'WEEKLY_2X', 'WEEKLY_3X') NOT NULL,
    ADD COLUMN `programId` INTEGER NOT NULL,
    ADD COLUMN `suggestedDurationSec` INTEGER NOT NULL,
    ADD COLUMN `timeMode` ENUM('MAX', 'SEC_30', 'SEC_60', 'SEC_90', 'SEC_120') NOT NULL;

-- AlterTable
ALTER TABLE `ActivityProgress` DROP COLUMN `activityId`,
    DROP COLUMN `completed`,
    ADD COLUMN `dayPlanActivityId` INTEGER NOT NULL,
    ADD COLUMN `occurrenceNumber` INTEGER NOT NULL,
    MODIFY `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `DayPlanActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayPlanId` INTEGER NOT NULL,
    `activityId` INTEGER NOT NULL,
    `plannedOccurrences` INTEGER NOT NULL DEFAULT 1,
    `sortOrder` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DayPlanActivity_dayPlanId_sortOrder_idx`(`dayPlanId`, `sortOrder`),
    INDEX `DayPlanActivity_activityId_idx`(`activityId`),
    UNIQUE INDEX `DayPlanActivity_dayPlanId_activityId_key`(`dayPlanId`, `activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Activity_programId_sortOrder_idx` ON `Activity`(`programId`, `sortOrder`);

-- CreateIndex
CREATE INDEX `ActivityProgress_dayPlanActivityId_idx` ON `ActivityProgress`(`dayPlanActivityId`);

-- CreateIndex
CREATE UNIQUE INDEX `ActivityProgress_userId_dayPlanActivityId_occurrenceNumber_key` ON `ActivityProgress`(`userId`, `dayPlanActivityId`, `occurrenceNumber`);

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DayPlanActivity` ADD CONSTRAINT `DayPlanActivity_dayPlanId_fkey` FOREIGN KEY (`dayPlanId`) REFERENCES `DayPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DayPlanActivity` ADD CONSTRAINT `DayPlanActivity_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityProgress` ADD CONSTRAINT `ActivityProgress_dayPlanActivityId_fkey` FOREIGN KEY (`dayPlanActivityId`) REFERENCES `DayPlanActivity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
