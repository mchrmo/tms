import taskCommentController from "@/lib/controllers/tasks/taskComments.controller";
import { errorHandler } from "@/lib/services/api.service";



export const GET = errorHandler(taskCommentController.getTaskComment)

export const DELETE = errorHandler(taskCommentController.deleteTaskComment)
