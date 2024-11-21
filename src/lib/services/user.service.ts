import { getUserByClerkId, getUserRole } from "../db/user.repository";
import { createClerkUser, updateClerkUser } from "../clerk";

import { sendWelcomeEmail } from "./mail.service";
import { User, clerkClient, currentUser } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { ApiError } from "next/dist/server/api-utils";
import { ZUserUpdateForm } from "../models/user.model";


const get_user = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {id},
    include: {
      role: true,
      OrganizationMember: {
        select: {
          id: true,
          organization: {select: {id: true, name: true}},
          position_name: true,
          manager: {select: {id: true, user: {select: {name: true}}}}
        }
      }
    }
  })

  return user
}
export type UserDetail = Prisma.PromiseReturnType<typeof get_user>

export const userListItem = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
  }
})
export type UserListItem = Prisma.UserGetPayload<typeof userListItem>


const create_user = async ({name, email, roleId}: {name: string, email: string, roleId?: number}) => {

  const password =  Math.random().toString(36).slice(-8);

  const role = await getUserRole(roleId || 2)

  if(!role) throw new Error("Incorrect user role")

  let clerkUser: User | undefined;
  const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] })
  if(clerkUsers.totalCount > 0) clerkUser = clerkUsers.data[0]
  else clerkUser = await createClerkUser(name, email, password, role)

  if(!clerkUser) throw new Error("Clerk user was not found")

  const existingUser = await prisma.user.findUnique({where: {email}})
  if(existingUser) throw new ApiError(400, "Užívateľ s takýmto emailom už existuje.")

  await clerkClient.users.updateUserMetadata(clerkUser.id, {
    privateMetadata: {
      user: existingUser
    },
  })


  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      clerk_id: clerkUser.id,
      role: {
        connect: {id: 2}
      }
    },
    
  });
  
  console.log(email, password);
  
  sendWelcomeEmail(email, email, password)
  sendWelcomeEmail('mchrmo@gmail.com', email, password)

  return user

}

const update_user = async (data: ZUserUpdateForm) => {

  const user = await prisma.user.update({
    where: {id: data.id},
    data
  });
  
  return user
}

const reset_registration = async (clerk_id: string) => {
 
  const user = await getUserByClerkId(clerk_id)
  if(!user) throw new Error("User was not found")

  const password =  Math.random().toString(36).slice(-8);

  let clerkUser: User | undefined;
  clerkUser = await updateClerkUser(clerk_id, password)
  
  sendWelcomeEmail(user.email, user.email, password)
  sendWelcomeEmail('mchrmo@gmail.com', user.email, password)
  
  return clerkUser

}

const get_current_user = async () => {
  
  const clerkUser = await currentUser()
  if(!clerkUser) return null

  const user = await getUserByClerkId(clerkUser.id)

  return user
}

const set_new_pasword = async (clerk_id: string, newPassword: string) => {
  

  let clerkUser = await updateClerkUser(clerk_id, newPassword)

  return clerkUser
}

export type CurrentUserDetail = Prisma.PromiseReturnType<typeof get_current_user>



const userService = {
  get_user,
  create_user,
  update_user,
  reset_registration,
  get_current_user,
  set_new_pasword
}

export default userService