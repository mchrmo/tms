import meetingsController from "@/lib/controllers/meetings/meetings.controller";
import { errorHandler } from "@/lib/services/api.service";

export const GET = errorHandler(meetingsController.getCSV)
