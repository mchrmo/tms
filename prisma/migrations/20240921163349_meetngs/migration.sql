/*
  Warnings:

  - You are about to drop the column `member_id` on the `meetingattendant` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `MeetingAttendant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `meetingattendant` DROP FOREIGN KEY `MeetingAttendant_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `meetingitem` DROP FOREIGN KEY `MeetingItem_creator_id_fkey`;

-- DropForeignKey
ALTER TABLE `meetingitemcomment` DROP FOREIGN KEY `MeetingItemComment_creator_id_fkey`;

-- AlterTable
ALTER TABLE `meetingattendant` DROP COLUMN `member_id`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MeetingAttendant` ADD CONSTRAINT `MeetingAttendant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingItem` ADD CONSTRAINT `MeetingItem_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingItemComment` ADD CONSTRAINT `MeetingItemComment_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
