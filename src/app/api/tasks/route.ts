import { getTaskList } from "@/lib/db/task.repository";
import { getUserByClerkId } from "@/lib/db/user.repository";
import { TASK_COLUMNS_PATHS } from "@/lib/models/task.model";
import prisma from "@/lib/prisma";
import { create_task, update_task } from "@/lib/services/task.service";
import { auth } from "@clerk/nextjs/server";
import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { parseArgs } from "util";
import { z } from "zod";


export const GET = async (request: NextRequest) => {


  const params = request.nextUrl.searchParams

  const where: Prisma.TaskWhereInput = {}
  
  const sortBy = params.get('sortBy')
  
  let sort: Prisma.TaskOrderByWithRelationAndSearchRelevanceInput = {
    createdAt: 'desc'
  }

  if(sortBy) {
    const sortDirection = params.get('sortDirection') == 'desc' ? 'desc' : 'asc'
    if(sortBy in TASK_COLUMNS_PATHS) {
      sort = TASK_COLUMNS_PATHS[sortBy](sortDirection)
    }
  }


  
  params.forEach((value, key) => {

    switch(key) {
      case 'priority':
        where.priority = {equals: value as TaskPriority}
        break;
      case 'status':
        where.status = {equals: value as TaskStatus}
        break;
      case 'parent_id':
        where.parent_id = parseInt(value)
        break;  
      default:
        if(key in TASK_COLUMNS_PATHS) {
          const path = TASK_COLUMNS_PATHS[key]({contains: value})
          Object.assign(where, path)
        }
        
        break;
    }
    


  });

  console.log(where);
  
  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }

  const tasks = await getTaskList(where, sort)
  // const tasks: Task[] = []

  // await new Promise(resolve => setTimeout(resolve, 1000));
  return NextResponse.json(tasks, { status: 200 });
};


export const POST = async (request: NextRequest) => {

  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }

  const user = await getUserByClerkId(userId)
  if(!user?.OrganizationMember.length) {
    return NextResponse.json({error: "Užívateľ nie je súčasťou žiadnej organizácie."}, {status: 400})
  }

  const memberId = user?.OrganizationMember[0].id

  if(!memberId) {
    return NextResponse.json({error: "Užívateľ nie je súčasťou žiadnej organizácie."}, {status: 400})
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

