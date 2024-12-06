import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import prisma from "../../prisma";
import { z } from "zod";
import { TaskCommentCreateSchema, TaskCommentCreateServiceSchema, TaskCommentUpdateSchema } from "../../models/taksComment.model";
import userService from "../user.service";
import { sendEmail } from "../mail.service";

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
    include: {
      user: true
    }
  });

  const task = await prisma.task.findUnique({where: {id: taskComment.task_id}, select: {assignee: {select: {user_id: true}}, name: true}})
  const allComments = await prisma.taskComment.findMany({where: {task_id: taskComment.task_id}, select: {user_id: true}})

  const affectedUsers: number[] = [task?.assignee?.user_id!]
  allComments.forEach(c => !affectedUsers.includes(c.user_id) && affectedUsers.push(c.user_id))

  const currUIndex = affectedUsers.findIndex(id => id == currentUser.id)
  if(currUIndex > -1) affectedUsers.splice(currUIndex, 1)
    
  const users = await prisma.user.findMany({where: {id: {
    in: affectedUsers
  }}, select: {email: true}})   
  const emails = users.map(u => u.email)

  for (const email of emails) {
    const notification = `
      <b>${taskComment.user.name} pridal/a komentár k úlohe <a href="${process.env.NEXT_PUBLIC_URL}/tasks/${taskComment.task_id}">${task?.name}</a></b>: <br>
      ${taskComment.message}
    `

    console.log(email);
    
    await sendEmail({
      to: email,
      subject: `Nová správa od ${taskComment.user.name}`,
      html: notification
    })
  }

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