import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  const data = await request.json()
  
  data.type = 'main'

  // auth().protect()
  const newOrg = await prisma.organization.create({
    data: data
  })    
  return NextResponse.json(newOrg, { status: 200 });
};

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