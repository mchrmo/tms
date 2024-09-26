import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { getMember } from "../../db/organizations";
import { sendAssigneeChangeNotification } from "../mail.service";
import prisma from "../../prisma";
import { z } from "zod";
import { TaskReminderCreateSchema, TaskReminderUpdateSchema } from "../../models/taskReminder.model";

export const taskReminderListItem = Prisma.validator<Prisma.TaskReminderDefaultArgs>()({
  include: {
    member: {
      select: {
        user: {
          select: {
            name: true
          }
        }
      }
    }
  }
})
export type TaskReminderListItem = Prisma.TaskReminderGetPayload<typeof taskReminderListItem>


const get_taskReminder = async (id: number) => {

  const taskReminder = await prisma.taskReminder.findUnique({
    where: {id},
  })

  return taskReminder
}

export type TaskReminderDetail = Prisma.PromiseReturnType<typeof get_taskReminder>

const create_taskReminder = async (data: z.infer<typeof TaskReminderCreateSchema>) => {
  const { ...reminderData } = data;


  const taskReminder = await prisma.taskReminder.create({
    data: {
      ...reminderData,
    },
  });

  return taskReminder
}

const update_taskReminder = async (data: z.infer<typeof TaskReminderUpdateSchema>) => {

  const taskReminder = await prisma.taskReminder.update({
    where: {
        id: data.id
    },
    data: data,
    
});

  return taskReminder
}

const delete_taskReminder = async (taskReminder_id: number) => {


  const taskReminder = await prisma.taskReminder.delete({
      where: {
          id: taskReminder_id
      }
  })

  return taskReminder
}


const taskReminderService = {
  get_taskReminder,
  create_taskReminder,
  update_taskReminder,
  delete_taskReminder
}

export default taskReminderService