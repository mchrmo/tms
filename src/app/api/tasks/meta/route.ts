import taskMetaController from "@/lib/controllers/tasks/taskMeta.controller";
import { errorHandler } from "@/lib/services/api.service";


export const POST = errorHandler(taskMetaController.addTaskMeta)

export const DELETE = errorHandler(taskMetaController.deleteTaskMeta)
