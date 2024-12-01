import { TaskUserRole } from "@prisma/client";


export const isTaskRole = (roles: TaskUserRole[], currentRole: TaskUserRole) => {
  if(roles.includes(currentRole)) return true
  return false
}