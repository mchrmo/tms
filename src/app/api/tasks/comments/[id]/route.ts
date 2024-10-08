import taskCommentController from "@/lib/controllers/tasks/taskComments.controller";
import { errorHandler } from "@/lib/utils/api.utils";



export const GET = errorHandler(taskCommentController.getTaskComment)

export const DELETE = errorHandler(taskCommentController.deleteTaskComment)
