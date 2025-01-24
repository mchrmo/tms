import { NextResponse } from 'next/server';
import Email from 'vercel-email';

export const GET = async () => {

    // await sendWelcomeEmail('chrmo.keepsmart@gmail.com', "TEST")


    
  
    
    return NextResponse.json({ message: "Success: email was sent" }, { status: 200 });
};