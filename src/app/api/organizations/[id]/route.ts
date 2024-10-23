import organizationsController from "@/lib/controllers/organizations/organizations.controller";
import { errorHandler } from "@/lib/services/api.service";

export const GET = errorHandler(organizationsController.getOrganization)

export const DELETE = errorHandler(organizationsController.deleteOrganization)
