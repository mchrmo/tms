import meetingAttendantsGroupController from "@/lib/controllers/meetings/meetingAttendantsGroup.controller";
import { errorHandler } from "@/lib/services/api.service";

export const PATCH = errorHandler(meetingAttendantsGroupController.updateMeetingAttendantsGroup)
export const DELETE = errorHandler(meetingAttendantsGroupController.deleteMeetingAttendantsGroup)
