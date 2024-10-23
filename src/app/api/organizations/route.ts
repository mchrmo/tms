import organizationsController from "@/lib/controllers/organizations/organizations.controller"
import { errorHandler } from "@/lib/services/api.service"


export const GET = errorHandler(organizationsController.getOrganizations)

export const POST = errorHandler(organizationsController.createOrganization)

export const PATCH = errorHandler(organizationsController.updateOrganization)
