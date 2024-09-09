import taskUpdatesController from "@/lib/controllers/taskUpdates.controller";
import { errorHandler } from "@/lib/utils/api.utils";


export const GET = errorHandler(taskUpdatesController.getTaskUpdates)
