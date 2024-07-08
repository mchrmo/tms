import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest) => {

  const search = request.nextUrl.searchParams.get("search")

  
  // auth().protect()
  const data = await prisma.organizationMember.findMany({
    include: {
      user: true
    },
    where: {
      user: {
        name: {
          contains: search ? search : ''
        }
      }
    }
  })

  
  return NextResponse.json(data, { status: 200 });
};

export const POST = async (request: NextRequest) => {
  const data = await request.json()
  
  console.log(data);
  
  // auth().protect()
  const newMember = await prisma.organizationMember.create({
    data: data
  })    
  return NextResponse.json(data, { status: 200 });
};



export const DELETE = async (request: NextRequest) => {

  
  const memberId = request.nextUrl.searchParams.get("id")
  if(!memberId) return

  // auth().protect()
  await prisma.organizationMember.delete({
    where: {
      id: parseInt(memberId)
    }
  })    
  return NextResponse.json({}, { status: 200 });
};