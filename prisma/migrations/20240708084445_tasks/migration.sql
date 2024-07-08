/*
  Warnings:

  - You are about to drop the column `type_id` on the `task` table. All the data in the column will be lost.
  - Made the column `creator_id` on table `task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_creator_id_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_type_id_fkey`;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `type_id`,
    MODIFY `creator_id` INTEGER NOT NULL,
    MODIFY `source` VARCHAR(191) NOT NULL DEFAULT 'Organizačná úloha',
    MODIFY `completition_date` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `OrganizationMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
