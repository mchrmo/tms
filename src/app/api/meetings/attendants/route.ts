import meetingAttendantsController from "@/lib/controllers/meetings/meetingAttendants.controller";
import { errorHandler } from "@/lib/services/api.service";

export const POST = errorHandler(meetingAttendantsController.createMeetingAttendant)
