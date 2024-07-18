import { getTaskList } from "@/lib/db/task.repository";
import { getUserByClerkId } from "@/lib/db/user.repository";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest) => {

  
  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }

  const user = await getUserByClerkId(userId)
  if(user?.OrganizationMember) {
    return NextResponse.json([], { status: 200 });
  }
  
  const memberId = user?.OrganizationMember[0].id

  
  const tasks = await getTaskList({
    assignee_id: memberId  
  })

  
  return NextResponse.json(tasks, { status: 200 });
};