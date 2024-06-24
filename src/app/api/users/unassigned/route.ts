import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {

  const search = request.nextUrl.searchParams.get("search")
  
    
  const users = await prisma.user.findMany({
    where: {
      OrganizationMember: { none: {} },
      name: {
        contains: search ? search : ''
      }
    }
  })
    
    return NextResponse.json(users, { status: 200 });
};