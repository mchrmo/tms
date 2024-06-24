import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const GET = async () => {

    if(!auth().userId) {
        return NextResponse.json({error: "Access denied."}, {status: 401})
    }
    
    // auth().protect()
    const data = await clerkClient.users.getUserList()
    
    return NextResponse.json(data, { status: 200 });
};