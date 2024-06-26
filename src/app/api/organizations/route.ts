import { getMainOrganization } from '@/lib/db/organizations';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// export const GET = async () => {

//     // auth().protect()
//     const data = await getMainOrganization()
    
//     return NextResponse.json(data, { status: 200 });
// };


export const GET = async (request: NextRequest) => {

  const search = request.nextUrl.searchParams.get("search")

  
  // auth().protect()
  const data = await prisma.organization.findMany({
    where: {
      name: {
        contains: search ? search : ''
      }
    }
  })
  
  return NextResponse.json(data, { status: 200 });
};