import organizationMembersController from "@/lib/controllers/organizations/organizationMembers.controller";
import { errorHandler } from "@/lib/services/api.service";

export const GET = errorHandler(organizationMembersController.getOrganizationMember)

export const DELETE = errorHandler(organizationMembersController.deleteOrganizationMember)
