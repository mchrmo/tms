import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { unstable_noStore as noStore } from 'next/cache';




export async function getTaskList(filter?: Prisma.TaskWhereInput) {

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
    // orderBy: {
    //   deadline: 'asc'
    // }
  });

  return tasks
}

export async function getTask(id: number) {
  noStore();  

  const task = await prisma.task.findUnique({
    where: {id},
    include: {
      assignee: {
        include: {user: true}
      }
    }
  })

  return task
}


export async function createTask(taskData: Prisma.TaskUncheckedCreateInput | Prisma.TaskCreateInput) {
  const task = await prisma.task.create({
    data: taskData,
    include: {
      creator: true
    }
  })

  return task
} 

export async function updateTask(id: number, taskData: Prisma.TaskUncheckedUpdateInput | Prisma.TaskUpdateInput) {
  const task = await prisma.task.update({
    where: {id},
    data: taskData,
  })

  return task
} 

export async function createTaskUpdate(updateData: Prisma.TaskUpdateCreateInput) {
  
  const update = await prisma.taskUpdate.create({
    data: updateData
  })

  return update
}