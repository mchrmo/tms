import meetingAttendantsGroupController from "@/lib/controllers/meetings/meetingAttendantsGroup.controller";
import { errorHandler } from "@/lib/services/api.service";

export const POST = errorHandler(meetingAttendantsGroupController.applyGroupToMeeting)
