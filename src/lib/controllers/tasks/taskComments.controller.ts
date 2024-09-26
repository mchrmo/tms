import { NextRequest, NextResponse } from "next/server";
import { paginate, parseFilter, parseQueryParams } from "@/lib/utils/api.utils";
import { Prisma, TaskComment } from "@prisma/client";
import taskCommentService, { taskCommentListItem } from "../../services/tasks/taskComment.service";
import { ApiError } from "next/dist/server/api-utils";
import { TaskCommentCreateSchema, TaskCommentCreateServiceSchema, TaskCommentUpdateSchema } from "../../models/taksComment.model";
import { getMember } from "../../db/organizations";
import memberService from "../../services/member.service";
import { z } from "zod";
import userService from "../../services/user.service";


const getTaskComment = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)
  const taskComment = await taskCommentService.get_taskComment(id)  
  if(!taskComment) throw new ApiError(404, 'Not found')
  
  return NextResponse.json(taskComment, { status: 200 })
}

const getTaskComments = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {
    pagination: {page, pageSize},
    filters,
    order
  } = parseQueryParams(params)

  const where: Prisma.TaskCommentWhereInput = parseFilter(filters, {task_id: 'number', description: 'string', id: 'number'})
  for (const [field, value] of Object.entries(filters)) {
    switch(field) {
    }
  }

  const data = await paginate({
    modelName: 'TaskComment',
    page,
    pageSize,
    where,
    orderBy: order,
    ...taskCommentListItem as any 
  })
  

  return NextResponse.json(data, { status: 200 })
}

const createTaskComment = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = TaskCommentCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  
  const currentUser = await userService.get_current_user()
  if(!currentUser)  return NextResponse.json({
    error: { message: "Forbidden" },
  }, {status: 403});

  const member = await memberService.get_current_member(currentUser.id)
  
  if(!member) { return NextResponse.json({
    error: { message: "No member" },
  }, {status: 403});}

  const data: z.infer<typeof TaskCommentCreateServiceSchema> = {
    creator_id: member.id,
    ...parsedSchema.data
  }
  const taskComment = await taskCommentService.create_taskComment(data)


  return NextResponse.json(taskComment, { status: 200 })
  
};

const updateTaskComment = async (request: NextRequest) => {  
  const body = await request.json()
  const parsedSchema = TaskCommentUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  const taskComment = await taskCommentService.update_taskComment(updateData)


  return NextResponse.json(taskComment, { status: 200 })
  
};

const deleteTaskComment = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const taskComment = await taskCommentService.delete_taskComment(id)  

  return NextResponse.json(taskComment, { status: 200 })

}


const taskCommentsController = {
  getTaskComment,
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment
}

export default taskCommentsController