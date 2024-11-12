'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import userService from '@/lib/services/user.service';
import prisma from '@/lib/prisma';
import { Prisma, User, UserRole } from '@prisma/client';


const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <UserProvider> */}
        {children}
      {/* </UserProvider> */}

    </QueryClientProvider>
  );
}



type Role = UserRole['name']; // Add roles as needed


// Define the UserContext type

interface UserProviderProps {
  user: User | null;
  children: ReactNode;
}

interface UserContextType  {
  user: User
}

const UserContext = createContext<UserContextType  | null>(null);

const UserProvider: React.FC<UserProviderProps> = ({ user, children }) => {

  if(!user) return "Error" 
  return <UserContext.Provider value={{user}}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType | null => useContext(UserContext);
export default UserProvider;
