import meetingItemsController from "@/lib/controllers/meetings/meetingItems.controller";
import { errorHandler } from "@/lib/services/api.service";

export const GET = errorHandler(meetingItemsController.getMeetingItem)

export const DELETE = errorHandler(meetingItemsController.deleteMeetingItem)
