import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SessionResource } from '@clerk/types'

export const DATE_FORMAT = "dd.MM.yyyy"

export const TASK_PRIORITIES_MAP = {
  "LOW": "Nízka",
  "MEDIUM": "Stredná",
  "HIGH": "Vysoká",
  "CRITICAL": "Kritická"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getUserRole(session?: CustomJwtSessionClaims | null) {

  if (
    !session ||
    !session.metadata ||
    !session.metadata.role
  ) {
    return null; // Return null if the user is not a basic member
  } 
  
  return session.metadata.role; // Return null if no role is found in the memberships
}

export function isRole(session: CustomJwtSessionClaims | null, roleName: string) {

  const role = getUserRole(session)

  if(!role) return false

  if(role.name === roleName) return true
  
  return false
}


