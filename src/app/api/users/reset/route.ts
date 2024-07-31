import { reset_registration } from "@/lib/services/user.service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {

  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }


  const params = request.nextUrl.searchParams
  const id = params.get('id')
  
  if(!id) return NextResponse.json({error: "Nesprávne ID."}, {status: 401})

  const task = await reset_registration(id)

  return NextResponse.json(task, { status: 200 })
  
};
