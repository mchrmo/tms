import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SessionResource } from '@clerk/types'
import { User } from "@clerk/nextjs/server"
import { UserRole } from "@prisma/client"

export const DATE_FORMAT = "dd.MM.yyyy"



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// export function getUserRole(session?: CustomJwtSessionClaims | null) {

//   if (
//     !session ||
//     !session.metadata ||
//     !session.metadata.role
//   ) {
//     return null; // Return null if the user is not a basic member
//   } 
  
//   return session.metadata.role; // Return null if no role is found in the memberships
// }

// export function isRole(session: CustomJwtSessionClaims | null, roleName: string) {

  // const role = getUserRole(session)

  // if(!role) return false

  // if(role.name === roleName) return true
  
  // return false
// }



export function getUserRole(user: User): UserRole | null {
  if(!user) return null
  if (
    !user.publicMetadata ||
    !user.publicMetadata.role
  ) {
    return null;
  } 
  
  return user.publicMetadata.role as UserRole; // Return null if no role is found in the memberships
}

export function isRole(user: User | null, roleName: string) {

  if(!user) return false

  const role = getUserRole(user)
  if(!role) return false

  if(role.name === roleName) return true
  
  return false
}



export const parseBoolean = (value?: string | null): boolean => {
  const bool = (value === "true")
  if(bool) return true
  else return false
} 