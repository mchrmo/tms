-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_organization_id_fkey`;

-- AlterTable
ALTER TABLE `task` MODIFY `organization_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
