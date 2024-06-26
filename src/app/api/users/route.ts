import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {

    if(!auth().userId) {
        return NextResponse.json({error: "Access denied."}, {status: 401})
    }
    
    const search = request.nextUrl.searchParams.get("search")

  
    // auth().protect()
    const data = await prisma.user.findMany({
      where: {
        name: {
          contains: search ? search : ''
        }
      }
    })    

    return NextResponse.json(data, { status: 200 })
    
};