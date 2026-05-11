import taskSubscriptionsController from "@/lib/controllers/tasks/taskSubscriptions.controller";
import { errorHandler } from "@/lib/services/api.service";

export const GET = errorHandler(taskSubscriptionsController.getMyTaskSubscription);

export const POST = errorHandler(taskSubscriptionsController.upsertTaskSubscription);
