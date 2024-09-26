import meetingItemsController from "@/lib/controllers/meetings/meetingItems.controller";
import { errorHandler } from "@/lib/services/api.service";

export const DELETE = errorHandler(meetingItemsController.deleteComment)
