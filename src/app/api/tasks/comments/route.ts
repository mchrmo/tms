import taskCommentController from "@/lib/controllers/tasks/taskComments.controller";
import { errorHandler } from "@/lib/services/api.service";


export const GET = errorHandler(taskCommentController.getTaskComments)

export const POST = errorHandler(taskCommentController.createTaskComment)

export const PATCH = errorHandler(taskCommentController.updateTaskComment)
