import { sendWelcomeEmail } from '@/lib/services/mail';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const GET = async () => {

    await sendWelcomeEmail('mchrmo@gmail.com', "TEST")
  
    
    return NextResponse.json({ message: "Success: email was sent" }, { status: 200 });
};