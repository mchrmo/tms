-- AlterTable
ALTER TABLE `meetingattendant` MODIFY `role` ENUM('CREATOR', 'ATTENDANT') NOT NULL DEFAULT 'ATTENDANT';

-- AlterTable
ALTER TABLE `meetingitemcomment` MODIFY `message` TEXT NOT NULL;
