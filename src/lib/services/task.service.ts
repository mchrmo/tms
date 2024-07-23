import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { createTask, createTaskUpdate, updateTask } from "../db/task.repository";
import { getMember } from "../db/organizations";



type CreateTaskReqs = {
  name: string;
  priority: TaskPriority;
  description: string;
  parent_id?: number | null;
  organization_id?: number;
  creator_id: number;
  assignee_id?: number;
  source?: string;
  deadline: Date;
}

export async function create_task(taskData: CreateTaskReqs) {

  const member = await getMember(taskData.creator_id)


  const organization_id = taskData.organization_id ? taskData.organization_id : member?.organization_id;
  const assignee_id = taskData.assignee_id ? taskData.assignee_id : member?.organization_id;

  const newTaskData: Prisma.TaskUncheckedCreateInput = {
    name: taskData.name,
    priority: taskData.priority,
    description: taskData.description,
    parent_id: taskData.parent_id,
    organization_id,
    assignee_id,
    creator_id: taskData.creator_id,
    deadline: taskData.deadline,
  }

  
  const task = await createTask(newTaskData);

  // const createUpdate = await createTaskUpdate({
  //   description: "Úloha vytvorená",
  //   task: {
  //     connect: {id: task.id}
  //   }, 
  //   user: {
  //     connect: {id: task.creator?.user_id}
  //   }
  // })


  return task
}


export async function update_task(taskData: Partial<Task>, userId?: number) {

  if(!taskData.id) return null

  const id = taskData.id
  const task = await updateTask(id, taskData);

  if(userId) {
    const createUpdate = await createTaskUpdate({
      description: "Úloha vytvorená",
      task: {
        connect: {id: task.id}
      }, 
      user: {
        connect: {id: userId}
      }
    })
  }



  return task
}
