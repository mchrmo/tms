import { NextRequest, NextResponse } from "next/server";
import { paginate, parseFilter, parseQueryParams } from "../../services/api.service";
import { Prisma, Task, User } from "@prisma/client";
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP, taskColumns, TaskUpdateSchema } from "../../models/task.model";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "../../db/user.repository";
import { z } from "zod";
import taskService, { TaskDetail } from "../../services/tasks/task.service";
import { createPaginator } from "prisma-pagination";
import { parseGetManyParams } from "@/lib/utils/api.utils";
import prisma from "@/lib/prisma";
import { AuthUser, getMembership, isHierachicalyAbove } from "@/lib/services/auth.service";

type TaskRole = 'assignee' | 'owner' | 'viewer'

export const getTaskRelationship = async (task: TaskDetail, user: AuthUser): Promise<null | TaskRole> => {


  const membership = await getMembership(user.id)!

  if(!membership) return null

  if(task?.assignee_id == membership?.id) return 'assignee'
  if(task?.creator_id == membership?.id) return 'owner'

  const isSuperiorToCreator = await isHierachicalyAbove(membership?.id, task?.creator_id!)
  if(isSuperiorToCreator) return 'viewer'

  const isSuperiorToAssignee = await isHierachicalyAbove(membership?.id, task?.creator_id!)
  if(isSuperiorToAssignee) return 'viewer'

  return null
}


const getTask = async (req: NextRequest, params: any) => {

  const taskId = parseInt(params.id)

  // auth().protect()
  const task = await taskService.get_task(taskId)  

  return NextResponse.json(task, { status: 200 })

}

const getTasks = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams
  const {where, orderBy, pagination} = parseGetManyParams(params, taskColumns)

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