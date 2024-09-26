import { createUser, getUserByClerkId, getUserRole } from "../db/user.repository";
import { createClerkUser, updateClerkUser } from "../clerk";

import { sendWelcomeEmail } from "./mail.service";
import { User, clerkClient, currentUser } from "@clerk/nextjs/server";

const create_user = async ({name, email, roleId}: {name: string, email: string, roleId: number}) => {

  const password =  Math.random().toString(36).slice(-8);

  const role = await getUserRole(roleId)

  if(!role) throw new Error("Incorrect user role")

  let clerkUser: User | undefined;
  const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] })
  if(clerkUsers.totalCount > 0) clerkUser = clerkUsers.data[0]
  else clerkUser = await createClerkUser(name, email, password, role)

  if(!clerkUser) throw new Error("Clerk user was not found")

  const user = await createUser({name, email, clerk_id: clerkUser.id})
  console.log(email, password);
  
  sendWelcomeEmail(email, email, password)
  sendWelcomeEmail('mchrmo@gmail.com', email, password)

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




const userService = {
  create_user,
  reset_registration,
  get_current_user
}

export default userService