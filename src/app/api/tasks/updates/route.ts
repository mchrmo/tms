import taskUpdatesController from "@/lib/controllers/tasks/taskUpdates.controller";
import { errorHandler } from "@/lib/utils/api.utils";


export const GET = errorHandler(taskUpdatesController.getTaskUpdates)
