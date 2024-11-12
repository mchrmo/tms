import { NextRequest, NextResponse } from "next/server";
import { paginate, parseFilter, parseQueryParams } from "../../services/api.service";
import { Prisma, Task, TaskUserRole, User } from "@prisma/client";
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP, taskColumns, TaskUpdateSchema } from "../../models/task.model";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "../../db/user.repository";
import { z } from "zod";
import taskService, { TaskDetail } from "../../services/tasks/task.service";
import { createPaginator } from "prisma-pagination";
import { parseGetManyParams } from "@/lib/utils/api.utils";
import prisma from "@/lib/prisma";
import { AuthUser, getMembership, getUser, isSuperior, isRole } from "@/lib/services/auth.service";





const getTask = async (req: NextRequest, params: any) => {

  const taskId = parseInt(params.id)

  const user = await getUser()
  let where: Partial<Prisma.TaskFindUniqueArgs['where']> = {
  }

  if(!await isRole('admin', user)) {
    where = {
      OR: [
        {assignee: {user_id: user?.id}},
        {creator: {user_id: user?.id}},
        {TaskRelationship: {
          some: {user_id: user?.id}
        }}
      ]  
    }
  }
  
  
  const task = await taskService.get_task(taskId, {where})

  return NextResponse.json(task, { status: 200 })

}

const getTasks = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams
  const {where: paramsWhere, orderBy, pagination} = parseGetManyParams(params, taskColumns)

  const user = await getUser()

  let where: Prisma.TaskWhereInput = {
  }

  if(!await isRole('admin', user)) {
    where = {
      OR: [
        {assignee: {user_id: user?.id}},
        {creator: {user_id: user?.id}},
        {TaskRelationship: {
          some: {user_id: user?.id}
        }}
      ]  
    }
  }
  
  where = {
    ...paramsWhere,
    ...where
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

  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  const data = await paginate<Task, Prisma.TaskFindManyArgs>(
    prisma.task,
    {
      where,
      orderBy,
      include: include,
    }
  )

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



const tasksController = {
  getTask,
  getTasks,
  createTask,
  updateTask,
  deleteTask
}
export default tasksController