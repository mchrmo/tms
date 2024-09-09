import tasksController from "@/lib/controllers/tasks.controller";
import { errorHandler } from "@/lib/services/api.service";

export const GET = errorHandler(tasksController.getTask)

export const DELETE = errorHandler(tasksController.deleteTask)
