import { getTaskList } from "@/lib/db/task.repository";
import { getUserByClerkId } from "@/lib/db/user.repository";
import prisma from "@/lib/prisma";
import { create_task, update_task } from "@/lib/services/task.service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


export const GET = async (request: NextRequest) => {
  const search = request.nextUrl.searchParams.get("search")

  
  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }

  // const user = await getUserByClerkId(userId)
  // const memberId = user?.OrganizationMember[0].id

  
  
  const tasks = await getTaskList(search ? {
    name: {contains: search}
  } : {})
  
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

export const PATCH = async (request: NextRequest) => {

  
  const schema = z.object({
    id: z.number(),
    name: z.string().optional(),
    description: z.string().optional(),
    deadline: z.coerce.date().optional(),
    assignee_id: z.number().optional(),
    priority: z.enum(['LOW', 'MEDIUM', "HIGH", "CRITICAL"]).optional(),
    parent_id: z.number().or(z.null()).optional(),
    status: z.enum(['TODO', 'WAITING', 'INPROGRESS', 'CHECKREQ', 'DONE']).optional(),
  });

  
  const body = await request.json()
  const parsedSchema = schema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  const task = await update_task(updateData)


  return NextResponse.json(task, { status: 200 })
  
};