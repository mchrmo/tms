'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import userService from '@/lib/services/user.service';
import prisma from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';


const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <RoleProvider> */}
        {children}
      {/* </RoleProvider> */}

    </QueryClientProvider>
  );
}



type Role = UserRole['name']; // Add roles as needed


// Define the RoleContext type

interface RoleProviderProps {
  role: Role;
  children: ReactNode;
}

const RoleContext = createContext<Role | null>(null);

const RoleProvider: React.FC<RoleProviderProps> = ({ role, children }) => {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
};

export const useRole = (): Role | null => useContext(RoleContext);
export default RoleProvider;
