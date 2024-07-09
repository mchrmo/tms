import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {

  const search = request.nextUrl.searchParams.get("search")
  let mode = request.nextUrl.searchParams.get("mode")

  if(mode !== 'assigned' && mode !== 'unassigned') {
    mode = 'unassigned'
  }

  const users = await prisma.user.findMany({
    where: {
      OrganizationMember: mode == 'unassigned' ? {none: {}} : {some: {}},
      name: {
        contains: search ? search : ''
      },
      role_id: {
        not: 1
      }
    }
  })

    
  return NextResponse.json(users, { status: 200 });
};
