import { Prisma } from "@prisma/client";
import prisma from "../prisma";




export async function getTaskList(filter?: Prisma.TaskWhereInput, sort?: Prisma.TaskOrderByWithRelationAndSearchRelevanceInput) {

  const tasks = await prisma.task.findMany({
    include: {
      assignee: {
        select: {user: {select: {name: true}}}
      },
      creator: {
        select: {user: {select: {name: true}}}
      },
      organization: {
        select: {name: true}
      }
    },
    where: filter ? filter : {},
    orderBy: sort
  });

  return tasks
}

export async function getTask(id: number) {

  const task = await prisma.task.findUnique({
    where: {id},
    include: {
      assignee: {
        include: {user: true},
      },
      parent: {
        select: {name: true, id: true}
      }
    }
  })

  return task
}


export async function createTask(taskData: Prisma.TaskUncheckedCreateInput | Prisma.TaskCreateInput) {
  const task = await prisma.task.create({
    data: taskData,
    include: {
      creator: true,
      assignee: true
    }
  })

  return task
} 

export async function updateTask(id: number, taskData: Prisma.TaskUncheckedUpdateInput | Prisma.TaskUpdateInput) {
  const task = await prisma.task.update({
    where: {id},
    data: taskData,
    include: {
      creator: true,
      assignee: true
    }
  })

  return task
} 

export async function createTaskUpdate(updateData: Prisma.TaskUpdateCreateInput) {
  
  const update = await prisma.taskUpdate.create({
    data: updateData
  })

  return update
}