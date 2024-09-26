import taskRemindersController from "@/lib/controllers/tasks/taskReminders.controller";
import { errorHandler } from "@/lib/utils/api.utils";



export const GET = errorHandler(taskRemindersController.getTaskReminder)

export const DELETE = errorHandler(taskRemindersController.deleteTaskReminder)
