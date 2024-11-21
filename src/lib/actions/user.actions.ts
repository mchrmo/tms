'use server'


import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import userService from '../services/user.service';


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
