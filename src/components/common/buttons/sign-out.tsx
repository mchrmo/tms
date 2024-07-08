'use client'

import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';
import clsx from 'clsx';
import { Power } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function SignOut({iconOnly}: {iconOnly?: boolean}) {
  const { signOut } = useClerk();
  const router = useRouter()

  if(iconOnly === undefined) iconOnly = false

  const handleSignOut = async () => {+
    signOut({redirectUrl: '/sign-in'});
    
  };
  
  return (
    <Button variant="ghost" onClick={handleSignOut}>
      <Power className={clsx(
        "h-4 w-4",
        {
          "mr-2": !iconOnly
        }
      )} /> 
      {
        !iconOnly && 'Odhlásiť sa'
      }
    </Button>
  );

}