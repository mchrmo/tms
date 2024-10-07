import { z } from "zod"

export const USER_ROLES_MAP: {[key: string]: string} = {
  "employee": "Zamestnanec",
  "admin": 'Administrátor'
}



export const passwordSchema =  z.string().min(8, "Heslo musí mať minimálne 8 znakov.")

export const NewUserSchema = z.object({
  email: z.string().email("Zadajte správny tvar emailu."),
  name: z.string().regex(new RegExp(/^[A-Z][a-z]*\s[A-Z][a-z]*/), "Zadajte meno a priezvisko"),
  phone: z.string().regex(/^\+\d+$/, "Musí začínať symbolo '+'").min(8, "Zadajte správne telefónne číslo")
})


export type UserRegistrationFormInputs = z.infer<typeof NewUserSchema>;
