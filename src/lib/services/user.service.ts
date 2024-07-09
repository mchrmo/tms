import { createUser, getUserRole } from "../db/user.repository";
import { createClerkUser } from "../clerk";

import { sendWelcomeEmail } from "./mail.service";
import { User, clerkClient } from "@clerk/nextjs/server";

export async function create_user({name, email, roleId}: {name: string, email: string, roleId: number}) {

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
  
  sendWelcomeEmail(email, password)
  sendWelcomeEmail('mchrmo@gmail.com', password)

  return user

}


