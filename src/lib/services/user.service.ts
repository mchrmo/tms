import { createUser } from "../db/users";
import { createUser as createClerkUser } from "../clerk";

import { sendWelcomeEmail } from "./mail.service";
import { User, clerkClient } from "@clerk/nextjs/server";

export default class UserService {


  public async create_user({name, email}: {name: string, email: string}) {

    const password =  Math.random().toString(36).slice(-8);
  
    let clerkUser: User | undefined;
    const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] })
    if(clerkUsers.totalCount > 0) clerkUser = clerkUsers.data[0]
    else clerkUser = await createClerkUser(name, email, password)

    if(!clerkUser) throw new Error("Clerk user was not found")

    const user = await createUser({name, email, clerk_id: clerkUser.id})
    sendWelcomeEmail(email, password)

    return user

  }
  
}
