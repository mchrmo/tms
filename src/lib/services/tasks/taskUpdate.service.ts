import { Prisma, Task, TaskPriority, TaskStatus, User } from "@prisma/client";
import { sendAssigneeChangeNotification } from "../mail.service";
import prisma from "../../prisma";
import { z } from "zod";
import userService from "../user.service";import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP } from "../../models/task.model";
import organizationMemberService from "../organizations/organizationMembers.service";
import taskRelService, { TaskWithUsers } from "./taskRelationship.service";

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

const create_taskUpdate = async (task: TaskWithUsers, user: User | null, key: string, value?: any) => {

  let description;
  let title = ''

  let changerName = user ? user.name : 'Systém'

  switch(key) {
    case 'created': {
      const member = await organizationMemberService.get_organizationMember(task.assignee_id!)
      title = 'Úloha vytvorená'
      description = `Úlohu vytvoril ${changerName} pre ${member?.user.name}`

      await taskRelService.update_allTaskRelationships(task)
    } break;
    case 'assignee_id': {
      if(!value) break; 
      const member = await organizationMemberService.get_organizationMember(value)
      title = `Zmena poverenej osoby`
      description = `${changerName} poveril ${member && member.user.name}`

      await taskRelService.update_allTaskRelationships(task)
    } break;
    case 'creator_id': {
      if(!value) break; 
      const member = await organizationMemberService.get_organizationMember(value)
      title = `Zmena vlastníka`
      description = `${changerName} zmenil vlastníka na ${member && member.user.name}`

      await taskRelService.update_allTaskRelationships(task)
    } break;
    case 'status': 
      if(!value) break; 
      title = `Stav zmenený`
      description = `${changerName} zmenil stav na ${TASK_STATUSES_MAP[task.status]}`
      break;
    case 'priority':  
      title = `Priorita zmenená`
      description = `${changerName} zmenil prioritu na ${TASK_PRIORITIES_MAP[task.priority]}`
      break;
    default:
      title = `Ostatná zmena - ${key}/${value}`
      break;
  }

  
  if(typeof value == 'number') value = value.toString()

  const updateData: Prisma.TaskUpdateCreateInput = {
    task: {
      connect: {id: task.id}
    },
    key,
    value,
    user: user ? {connect: {id: user.id}} : {},
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