import taskUpdatesController from "@/lib/controllers/tasks/taskUpdates.controller";
import { errorHandler } from "@/lib/services/api.service";


export const GET = errorHandler(taskUpdatesController.getTaskUpdates)
