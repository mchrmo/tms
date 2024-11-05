import organizationMembersController from "@/lib/controllers/organizations/organizationMembers.controller"
import { errorHandler } from "@/lib/services/api.service"

export const POST = errorHandler(organizationMembersController.swapOrganizationMember)

