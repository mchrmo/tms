// utils/clerk.js

import { User, clerkClient } from "@clerk/nextjs/server";
import { isKnownError } from '@clerk/nextjs/errors';


export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  try {

    const user = await clerkClient.users.createUser({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
      emailAddress: [email],
      password,
    });

    return user
  } catch (error) {
    
    console.log(error);
    throw new Error("Nepodarilo sa vytvoriť užívatela")

  }
};

