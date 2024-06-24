'use server'


import { z } from 'zod';
import { createUser as createClerkUser } from "../clerk";
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createUser } from '@/lib/db/users'
import { sendWelcomeEmail } from '../services/mail.service';
import UserService from '../services/user.service';


export type State<T> = {
  errors?: T;
  message?: string | null;
  success?: boolean;
};


export type RegistrationFields = {
  name?: string[];
  email?: string[];
}

const RegistrationFormSchema = z.object({

})

const userService = new UserService()

export async function create_user(prevState: State<RegistrationFields>, formData: FormData) {

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  try {
    const user = await userService.create_user({name, email})
    revalidatePath('/users')
    return {
      errors: {},
      message: 'Užívateľ vytvorený!',
      success: true
    };  


  } catch (error) {
    console.log(error);
    
    let message = 'Neznáma chyba'
    if (error instanceof Error) message = error.message

    return {
      errors: {},
      message
    };  
  }

}