import { createUser } from "../db/users";
import { createUser as createClerkUser } from "../clerk";

import { sendWelcomeEmail } from "./mail.service";

export default class UserService {


  public async create_user({name, email}: {name: string, email: string}) {

    const password =  Math.random().toString(36).slice(-8);
  
  
    const clerkUser = await createClerkUser(name, email, password)
    const user = await createUser({name, email, clerk_id: clerkUser.id})
    sendWelcomeEmail(email, password)

    return user

  }
  
}
