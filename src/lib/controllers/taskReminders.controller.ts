import { NextRequest, NextResponse } from "next/server";
import { paginate, parseFilter, parseQueryParams } from "@/lib/utils/api.utils";
import { Prisma } from "@prisma/client";
import taskReminderService, { taskReminderListItem } from "../services/taskReminder.service";
import { ApiError } from "next/dist/server/api-utils";
import { TaskReminderCreateSchema, TaskReminderUpdateSchema } from "../models/taskReminder.model";


const getTaskReminder = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)
  const taskReminder = await taskReminderService.get_taskReminder(id)  
  if(!taskReminder) throw new ApiError(404, 'Not found')
  
  return NextResponse.json(taskReminder, { status: 200 })
}

const getTaskReminders = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {
    pagination: {page, pageSize},
    filters,
    order
  } = parseQueryParams(params)

  const where: Prisma.TaskReminderWhereInput = parseFilter(filters, {task_id: 'number', description: 'string', id: 'number'})
  for (const [field, value] of Object.entries(filters)) {
    switch(field) {
    }
  }

  const data = await paginate({
    modelName: 'TaskReminder',
    page,
    pageSize,
    where,
    orderBy: order,
    ...taskReminderListItem as any 
  })
  

  return NextResponse.json(data, { status: 200 })
}

const createTaskReminder = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = TaskReminderCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const taskReminder = await taskReminderService.create_taskReminder(parsedSchema.data)


  return NextResponse.json(taskReminder, { status: 200 })
  
};

const updateTaskReminder = async (request: NextRequest) => {  
  const body = await request.json()
  const parsedSchema = TaskReminderUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  const taskReminder = await taskReminderService.update_taskReminder(updateData)


  return NextResponse.json(taskReminder, { status: 200 })
  
};

const deleteTaskReminder = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const taskReminder = await taskReminderService.delete_taskReminder(id)  

  return NextResponse.json(taskReminder, { status: 200 })

}


export default {
  getTaskReminder,
  getTaskReminders,
  createTaskReminder,
  updateTaskReminder,
  deleteTaskReminder
}