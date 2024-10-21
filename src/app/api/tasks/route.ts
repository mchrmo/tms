import tasksController from "@/lib/controllers/tasks/tasks.controller";
import { errorHandler } from "@/lib/services/api.service";


export const GET = errorHandler(tasksController.getTasks)

export const POST = errorHandler(tasksController.createTask)

export const PATCH = errorHandler(tasksController.updateTask)
