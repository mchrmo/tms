import { NextRequest, NextResponse } from "next/server";
import { DetailResponse, paginate, PaginatedResponse, parseFilter, parseQueryParams } from "../../services/api.service";
import { Prisma, Task, TaskUserRole, User } from "@prisma/client";
import { CreateTaskSchema, TASK_PRIORITIES_MAP, TASK_STATUSES_MAP, taskColumns, TaskUpdateSchema } from "../../models/task.model";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "../../db/user.repository";
import { z } from "zod";
import taskService, { TaskDetail } from "../../services/tasks/task.service";
import { createPaginator } from "prisma-pagination";
import { parseGetManyParams, unauthorizedError } from "@/lib/utils/api.utils";
import prisma from "@/lib/prisma";
import { AuthUser, getMembership, getUser, isSuperior, isRole } from "@/lib/services/auth.service";
import taskRelService from "@/lib/services/tasks/taskRelationship.service";
import { TasksResponse, TaskWithRelations } from "@/lib/types/task.types";


const getTask = async (req: NextRequest, params: any) => {

  const taskId = parseInt(params.id)

  const user = await getUser()
  const isAdmin = await isRole('admin', user)
  let where: Partial<Prisma.TaskFindUniqueArgs['where']> = {
  }

  if (!user) throw unauthorizedError

  let role: TaskUserRole;

  if (!isAdmin) {
    const rel = await taskRelService.get_taskRelationship(taskId, user.id)

    if (!rel) throw unauthorizedError
    role = rel.role
  } else role = 'ADMIN'

  const task = await taskService.get_task(taskId, { where })

  if (!task) NextResponse.json({}, { status: 404 })

  const response: DetailResponse<TaskDetail, TaskUserRole> = {
    role,
    data: task
  }

  return NextResponse.json(response, { status: 200 })
}

const getTasks = async (req: NextRequest): Promise<NextResponse<TasksResponse>> => {
  const params = req.nextUrl.searchParams
  const { where: paramsWhere, orderBy, pagination } = parseGetManyParams(params, taskColumns)

  const user = await getUser()
  let isAdmin = await isRole('admin', user)
  // isAdmin = false


  let where: Prisma.TaskWhereInput = {
  }

  if (!isAdmin) {
    const conditionScheme = {
      OR: [
        { assignee: { user_id: user?.id } },
        { creator: { user_id: user?.id } },
        {
          TaskRelationship: {
            some: { user_id: user?.id }
          }
        }
      ]
    }

    // Filter for first level tasks only

    if (!paramsWhere['name']) {
      where = {
        AND: [
          conditionScheme,
          paramsWhere.parent_id ? {} : {
            OR: [
              // Tasks with no parent
              { parent_id: null },
              // Tasks where user has no relationship to the parent
              {
                parent: {
                  NOT: conditionScheme
                }
              }
            ]
          }
        ]
      }
    }
  }

  where = {
    ...paramsWhere,
    ...where
  }

  // console.log(JSON.stringify(where, null, 2))
  const include: Prisma.TaskInclude = {
    assignee: {
      select: { user: { select: { name: true } } }
    },
    creator: {
      select: { user: { select: { name: true } } }
    },
    organization: {
      select: { name: true }
    },
    _count: {
      select: { SubTasks: true }
    },
    TaskRelationship: {
      where: { user_id: user?.id },
      select: { role: true }
    },
    parent: {
      select: {
        id: true,
        assignee: {
          select: { user_id: true }
        },
        creator: {
          select: { user_id: true }
        },
        TaskRelationship: {
          where: { user_id: user?.id },
          select: { role: true }
        }
      }
    }
  }

  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  const result = await paginate<Task, Prisma.TaskFindManyArgs>(
    prisma.task,
    {
      where,
      orderBy,
      include: include,
    }
  ) as PaginatedResponse<any>;

  // Add parent_role to each task
  const dataWithParentRole = result.data.map((task: any) => {
    let parent_role: 'CREATOR' | 'ASSIGNEE' | 'VIEWER' | null = null;

    if (task.parent && user) {
      // Check if user is creator of parent task
      if (task.parent.creator?.user_id === user.id) {
        parent_role = 'CREATOR';
      }
      // Check if user is assignee of parent task
      else if (task.parent.assignee?.user_id === user.id) {
        parent_role = 'ASSIGNEE';
      }
      // Check if user has relationship with parent task
      else if (task.parent.TaskRelationship?.length > 0) {
        parent_role = 'VIEWER';
      }
    }

    return {
      // id: task.id,
      // parent_id: task.parent_id,
      // parent_role,
      // role: task.TaskRelationship,
      ...task,
      parent_role
    };
  });

  const data: PaginatedResponse<TaskWithRelations> = {
    ...result,
    data: dataWithParentRole
  };

  return NextResponse.json(data, { status: 200 })
}




const createTask = async (request: NextRequest) => {

  const userId = auth().userId
  if (!userId) {
    return NextResponse.json({ error: "Access denied." }, { status: 401 })
  }

  const user = await getUserByClerkId(userId)

  if (!user?.OrganizationMember.length) {
    return NextResponse.json({ error: "Vytvárateľ nie je súčasťou žiadnej organizácie." }, { status: 400 })
  }

  const memberId = user?.OrganizationMember[0].id
  if (!memberId) {
    return NextResponse.json({ error: "Vytvárateľ nie je súčasťou žiadnej organizácie." }, { status: 400 })
  }

  const body = await request.json()
  const parsedSchema = CreateTaskSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, { status: 400 });
  }

  const newTaskData = {
    ...parsedSchema.data, ...{
      creator_id: memberId
    }
  }
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
    }, { status: 400 });
  }


  const updateData = { ...parsedSchema.data }

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