'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import userService from '@/lib/services/user.service';
import prisma from '@/lib/prisma';
import { Prisma, User, UserRole } from '@prisma/client';
import { TooltipProvider } from '@/components/ui/tooltip';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic refetching when window regains focus
      refetchOnWindowFocus: false,
      // Set stale time to 5 minutes to prevent unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Set cache time to 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      // Only retry failed requests once
      retry: 1,
      // Don't refetch when component remounts unless data is stale
      refetchOnMount: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
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
