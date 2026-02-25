-- CreateTable
CREATE TABLE `ActivityScheduleRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activityId` INTEGER NOT NULL,
    `ruleType` ENUM('DAILY', 'WEEKLY') NOT NULL,
    `occurrencesPerDay` INTEGER NOT NULL DEFAULT 1,
    `weeklyDaysCsv` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ActivityScheduleRule_activityId_key`(`activityId`),
    INDEX `ActivityScheduleRule_ruleType_idx`(`ruleType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActivityScheduleRule` ADD CONSTRAINT `ActivityScheduleRule_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
