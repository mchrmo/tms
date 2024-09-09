import { NextRequest, NextResponse } from "next/server";
import { paginate, parseFilter, parseQueryParams } from "../services/api.service";
import { Prisma } from "@prisma/client";
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP, TaskUpdateSchema } from "../models/task.model";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "../db/user.repository";
import { z } from "zod";
import taskService from "../services/task.service";


const getTask = async (req: NextRequest, params: any) => {

  const taskId = parseInt(params.id)

  // auth().protect()
  const task = await taskService.get_task(taskId)  

  return NextResponse.json(task, { status: 200 })

}

const getTasks = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {
    pagination: {page, pageSize},
    filters,
    order
  } = parseQueryParams(params)

  const where: Prisma.TaskWhereInput = parseFilter(filters, {name: 'string'})
  for (const [field, value] of Object.entries(filters)) {
    switch(field) {
      case 'status':
        if(Object.keys(TASK_STATUSES_MAP).includes(value)) where.status = value
        break;
      case 'priority':
        if(Object.keys(TASK_PRIORITIES_MAP).includes(value)) where.priority = value
        break;
      case 'creator_name':
        where.creator = {
          user: {name: {contains: value}}
        }
        break;
      case 'assignee_name':
        where.assignee = {
          user: {name: {contains: value}}
        }
        break;
      case 'organization_name':
        where.organization = {name: {contains: value}}
        break;
      case 'parent_id':
        where.parent_id = {equals: parseInt(value)}
        break;
    }
    
  }

  const include: Prisma.TaskInclude = {
    assignee: { 
      select: {user: {select: {name: true}}}
    },
    creator: {
      select: {user: {select: {name: true}}}
    },
    organization: {
      select: {name: true}
    }
  } 

  const data = await paginate({
    modelName: 'Task',
    page,
    pageSize,
    where,
    orderBy: order,
    include: include as any
  })
  

  return NextResponse.json(data, { status: 200 })
}

const createTask = async (request: NextRequest) => {

  const userId = auth().userId
  if(!userId) {
      return NextResponse.json({error: "Access denied."}, {status: 401})
  }

  const user = await getUserByClerkId(userId)
  
  if(!user?.OrganizationMember.length) {
    return NextResponse.json({error: "Vytvárateľ nie je súčasťou žiadnej organizácie."}, {status: 400})
  }

  const memberId = user?.OrganizationMember[0].id
  if(!memberId) {
    return NextResponse.json({error: "Vytvárateľ nie je súčasťou žiadnej organizácie."}, {status: 400})
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

  const task = await taskService.create_task(newTaskData)


  return NextResponse.json(task, { status: 200 })
  
};

const updateTask = async (request: NextRequest) => {

  
  const body = await request.json()
  const parsedSchema = TaskUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  const task = await taskService.update_task(updateData)


  return NextResponse.json(task, { status: 200 })
  
};

const deleteTask = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const task = await taskService.delete_task(id)  

  return NextResponse.json(task, { status: 200 })
}



export default {
  getTask,
  getTasks,
  createTask,
  updateTask,
  deleteTask
}