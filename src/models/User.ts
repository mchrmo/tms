export type User = {
  id?: number;
  clerk_id: string;
  name: string;
  email: string;
  role_id: number;
  role: UserRole;
}

export type UserRole = {
  id?: number;
  name: number;
  // Define other properties of UserRole here
}


export const userRolesMap: {[key: string]: string} = {
  "employee": "Zamestnanec",
  "admin": 'Administrátor'
}