import taskSubscriptionsController from "@/lib/controllers/tasks/taskSubscriptions.controller";
import { errorHandler } from "@/lib/services/api.service";

export const DELETE = errorHandler(taskSubscriptionsController.deleteTaskSubscription);
