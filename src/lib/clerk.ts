// utils/clerk.js

import { User, clerkClient } from "@clerk/nextjs/server";
import { isKnownError } from '@clerk/nextjs/errors';
import { UserRole } from "@prisma/client";


export const createClerkUser = async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
  try {

    const user = await clerkClient.users.createUser({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
      emailAddress: [email],
      password,
      publicMetadata: {
        role
      }
    });

    return user
  } catch (error) {
    
    console.log(error);
    throw new Error("Nepodarilo sa vytvoriť užívatela")

  }
};

export const updateClerkUser = async (id: string, password: string): Promise<User> => {
  try {

    const user = await clerkClient.users.updateUser(id, {password})

    return user
  } catch (error) {
    
    console.log(error);
    throw new Error("Nepodarilo sa vytvoriť užívatela")

  }
};

