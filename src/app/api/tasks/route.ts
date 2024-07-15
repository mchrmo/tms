import { getTaskList } from "@/lib/db/task.repository";
import { getUserByClerkId } from "@/lib/db/user.repository";
import prisma from "@/lib/prisma";
import { create_task, update_task } from "@/lib/services/task.service";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams

  const where: Prisma.TaskWhereInput = {}
  

  params.forEach((value, key) => {
    
    switch(key) {
      case 'name':
        where.name = {contains: value}
        break;

      // case 'createdAt': 
      //   where.createdAt = {
      //     gte: new Date(value)
      //   }
      case 'creator_name':
        where.creator = { user: {name: {contains: value}}}
        break;

      case 'assignee_name':
        where.assignee = { user: {name: {contains: value}}}  
        break;

      case 'organization_name':
        where.organization = {name: {contains: value}}
        break;
    }
    


  });
  
  // console.log(where);

  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }


  
  // if(search) {
  //   where.organization = {
  //     name: {
  //       contains: search
  //     }
  //   }

  //   where.name = {
  //     contains: search
  //   }
  // }


  const tasks = await getTaskList(where)
  
  return NextResponse.json(tasks, { status: 200 });
};


export const POST = async (request: NextRequest) => {

  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }

  const user = await getUserByClerkId(userId)
  const memberId = user?.OrganizationMember[0].id

  if(!memberId) {
    return NextResponse.json({error: "Invalid member id."}, {status: 400})
  }
  
  const schema = z.object({
    name: z.string(),
    description: z.string(),
    deadline: z.coerce.date(),
    assignee_id: z.number(),
    priority: z.enum(['LOW', 'MEDIUM', "HIGH", "CRITICAL"]),
    parent_id: z.number().or(z.null()).optional().default(null)
  });

  
  const body = await request.json()
  const parsedSchema = schema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const newTaskData = {...parsedSchema.data, ...{
    creator_id: memberId
  }}

  const task = await create_task(newTaskData)


  return NextResponse.json(task, { status: 200 })
  
};

