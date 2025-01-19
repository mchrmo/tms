'use client'

import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';
import { LogOut02 } from '@untitled-ui/icons-react';
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
    <Button variant="ghost" className='p-0 px-1 h-5' onClick={handleSignOut}>
        <LogOut02 width={20}></LogOut02>
    </Button>
  );

}