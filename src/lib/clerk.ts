// utils/clerk.js

import { User, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";


const client = clerkClient()
export const createClerkUser = async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
  try {

    const user = await client.users.createUser({
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

export const updateClerkUser = async (id: string, data: any): Promise<User> => {
  try {

    const user = await client.users.updateUser(id, data)

    return user
  } catch (error) {
    throw new Error("Nepodarilo sa upraviť užívatela")

  }
};

