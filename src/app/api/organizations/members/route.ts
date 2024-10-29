import organizationMembersController from "@/lib/controllers/organizations/organizationMembers.controller"
import { errorHandler } from "@/lib/services/api.service"


export const GET = errorHandler(organizationMembersController.getOrganizationMembers)

export const POST = errorHandler(organizationMembersController.createOrganizationMember)

// export const PATCH = errorHandler(organizationsController.updateOrganization)
