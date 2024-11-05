import { Prisma } from "@prisma/client";
import { z } from "zod"
import { ModelColumns } from "../utils/api.utils";

export const USER_ROLES_MAP: {[key: string]: string} = {
  "employee": "Zamestnanec",
  "admin": 'Administrátor'
}



export const passwordSchema =  z.string().min(8, "Heslo musí mať minimálne 8 znakov.")

export const NewUserSchema = z.object({
  email: z.string().email("Zadajte správny tvar emailu."),
  name: z.string().regex(new RegExp(/^[A-Z][a-z]*\s[A-Z][a-z]*/), "Zadajte meno a priezvisko"),
  phone: z.string().regex(/^\+\d+$/, "Musí začínať symbolom '+' a môže obsahovať len čísla").min(8, "Zadajte správne telefónne číslo")
})


export type UserRegistrationFormInputs = z.infer<typeof NewUserSchema>;


export const userListIncludes: Prisma.UserInclude = {
  role: true,
  OrganizationMember: {
    include: {
      organization: {
        select: {name: true}
      }
    }
  }
}


export const userColumns: ModelColumns = {
  'name': {
    type: 'string',
    method: 'contains',
    label: 'Meno'
  },
  'email': {
    type: 'string',
    method: 'contains',
    label: 'E-mail'
  },
  'role': {
    type: 'enum',
    path: 'role.name',
    label: "Rola",
    enum: USER_ROLES_MAP
  },
  'clerk_id': {
    type: 'string',
    method: 'contains',
    label: 'Clerk ID'
  },
  'organization': {
    type: 'string',
    method: 'contains',
    path: 'OrganizationMember.organization.name',
    disableSorting: true,
    customFn: (val) => ({OrganizationMember: {some: {organization: {name: {contains: val}}}}})
  },
  'fulltext': {
    type: 'string',
    customFn: (val) => ({OR: [
      {name: {contains: val}},
      {email: {contains: val}},
    ]})
  },
  'createdAt': {
    label: "Dátum registrácie",
    type: 'datetime',
  },
}
