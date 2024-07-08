'use server'


import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { create_user } from '../services/user.service';


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


export async function createUserAction(prevState: State<RegistrationFields>, formData: FormData) {

  const roleId = 2
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  try {
    const user = await create_user({name, email, roleId})
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