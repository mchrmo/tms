import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import prisma from "../../prisma";
import { z } from "zod";
import { TaskCommentCreateSchema, TaskCommentCreateServiceSchema, TaskCommentUpdateSchema } from "../../models/taksComment.model";
import userService from "../user.service";

export const taskCommentListItem = Prisma.validator<Prisma.TaskCommentDefaultArgs>()({
  include: {
    user: {
      select: {name: true}
    }
  }
})
export type TaskCommentListItem = Prisma.TaskCommentGetPayload<typeof taskCommentListItem>


const get_taskComment = async (id: number) => {

  const taskComment = await prisma.taskComment.findUnique({
    where: {id},
  })

  return taskComment
}

export type TaskCommentDetail = Prisma.PromiseReturnType<typeof get_taskComment>

const create_taskComment = async (data: z.infer<typeof TaskCommentCreateServiceSchema>) => {
  const { ...commentData } = data;

  const currentUser = await userService.get_current_user()
  if(!currentUser) return null



  const taskComment = await prisma.taskComment.create({
    data: {
      ...commentData,
      user_id: currentUser.id
    },
  });

  return taskComment
}

const update_taskComment = async (data: z.infer<typeof TaskCommentUpdateSchema>) => {

  const taskComment = await prisma.taskComment.update({
    where: {
        id: data.id
    },
    data: data,
    
});

  return taskComment
}

const delete_taskComment = async (taskComment_id: number) => {


  const taskComment = await prisma.taskComment.delete({
      where: {
          id: taskComment_id
      }
  })

  return taskComment
}


const taskCommentService = {
  get_taskComment,
  create_taskComment,
  update_taskComment,
  delete_taskComment
}

export default taskCommentService