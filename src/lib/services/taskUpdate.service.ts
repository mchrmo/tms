import { Prisma, Task, TaskPriority, TaskStatus, User } from "@prisma/client";
import { getMember } from "../db/organizations";
import { sendAssigneeChangeNotification } from "./mail.service";
import prisma from "../prisma";
import { z } from "zod";
import userService from "./user.service";import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP } from "../models/task.model";

export const taskUpdateListItem = Prisma.validator<Prisma.TaskUpdateDefaultArgs>()({
  include: {
  }
})
export type TaskUpdateListItem = Prisma.TaskUpdateGetPayload<typeof taskUpdateListItem>


const get_taskUpdate = async (id: number) => {

  const taskUpdate = await prisma.taskUpdate.findUnique({
    where: {id},
  })

  return taskUpdate
}

export type TaskUpdateDetail = Prisma.PromiseReturnType<typeof get_taskUpdate>

const create_taskUpdate = async (task: Task, user: User, key: string, value?: any) => {

  let description;
  let title = ''


  switch(key) {
    case 'created': {
      const member = await getMember(task.assignee_id!)
      title = 'Úloha vytvorená'
      description = `Úlohu vytvoril ${user.name} pre ${member?.user.name}`
    } break;
    case 'assignee_id': {
      if(!value) break; 
      const member = await getMember(value)
      title = `Zmena poverenej osoby`
      description = `${user.name} poveril/a ${member && member.user.name}`
    } break;
    case 'status': 
      if(!value) break; 
      title = `Stav zmenený`
      description = `${user.name} zmenil stav na ${TASK_STATUSES_MAP[task.status]}`
      break;
    case 'priority':  
      title = `Priorita zmenená`
      description = `${user.name} zmenil prioritu na ${TASK_PRIORITIES_MAP[task.priority]}`
      break;


    default:
      title = `Neidentifikovaná zmena - ${key}/${value}`
      break;
  }

  
  if(typeof value == 'number') value = value.toString()

  const updateData: Prisma.TaskUpdateCreateInput = {
    task: {
      connect: {id: task.id}
    },
    key,
    value,
    user: {connect: {id: user.id}},
    title,
    description
  }

  const taskUpdate = await prisma.taskUpdate.create({
    data: updateData,
  });

  return taskUpdate
}

const delete_taskUpdates = async (task_id: number) => {

  const taskUpdate = await prisma.taskUpdate.deleteMany({
      where: {
          task_id
      }
  })

  return taskUpdate
}


const taskUpdateService = {
  get_taskUpdate,
  create_taskUpdate,
  delete_taskUpdates
}

export default taskUpdateService