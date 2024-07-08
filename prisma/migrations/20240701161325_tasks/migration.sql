/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `Task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('TODO', 'WAITING', 'INPROGRESS', 'CHECKREQ', 'DONE') NOT NULL DEFAULT 'TODO',
    `priority` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `organization_id` INTEGER NOT NULL,
    `creator_id` INTEGER NULL,
    `assignee_id` INTEGER NULL,
    `source` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deadline` DATETIME(3) NOT NULL,
    `completition_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskUpdate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `creator_id` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Organization_name_key` ON `Organization`(`name`);

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `TaskType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `OrganizationMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_assignee_id_fkey` FOREIGN KEY (`assignee_id`) REFERENCES `OrganizationMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskUpdate` ADD CONSTRAINT `TaskUpdate_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskUpdate` ADD CONSTRAINT `TaskUpdate_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskComment` ADD CONSTRAINT `TaskComment_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskComment` ADD CONSTRAINT `TaskComment_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `OrganizationMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
