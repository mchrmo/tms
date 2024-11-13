import taskRemindersController from "@/lib/controllers/tasks/taskReminders.controller";
import { errorHandler } from "@/lib/services/api.service";


export const GET = errorHandler(taskRemindersController.getTaskReminders)

export const POST = errorHandler(taskRemindersController.createTaskReminder)

export const PATCH = errorHandler(taskRemindersController.updateTaskReminder)
