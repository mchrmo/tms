import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { createTask, createTaskUpdate, updateTask } from "../db/task.repository";
import { getMember } from "../db/organizations";
import { sendAssigneeChangeNotification } from "./mail.service";
import prisma from "../prisma";
import taskUpdateService from "./taskUpdate.service";
import userService from "./user.service";


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

const get_task = async (id: number) => {

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
export type TaskDetail = Prisma.PromiseReturnType<typeof get_task>

const create_task = async (taskData: CreateTaskReqs) => {

  const currentUser = await userService.get_current_user()
  if(!currentUser) return null

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

  if(member) {
    await sendAssigneeChangeNotification(member?.user_id, taskData.name)
  }

  const update = await taskUpdateService.create_taskUpdate(task, currentUser, 'created')


  return task
}

const update_task = async (taskData: Partial<Task>) => {

  if(!taskData.id) return null

  const currentUser = await userService.get_current_user()
  if(!currentUser) return null


  const id = taskData.id
  const originalTask = await get_task(id)
  const task = await updateTask(id, taskData);

  const updates: {[key: string]: any}= {}
  if(taskData.assignee_id && taskData.assignee_id !== originalTask?.assignee_id) updates.assignee_id = taskData.assignee_id
  if(taskData.status && taskData.status !== originalTask?.status) updates.status = taskData.status
  if(taskData.priority && taskData.priority !== originalTask?.priority) updates.priority = taskData.priority

  
  if(Object.keys(updates).includes('assignee_id')) {
    const member = await getMember(taskData.assignee_id!)
    if(member) {
      await sendAssigneeChangeNotification(member?.user_id, taskData.name! || originalTask?.name!)
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    const update = await taskUpdateService.create_taskUpdate(task, currentUser, key, value)
  }

  return task
}

const delete_task = async (task_id: number) => {

  const reminders = await prisma.taskReminder.deleteMany({
      where: {
          task_id
      }
  })

  const updates = await prisma.taskUpdate.deleteMany({
      where: {
        task_id
      }
  })

  const metadata = await prisma.taskMeta.deleteMany({
    where: {
      task_id
    }
  })

  const task = await prisma.task.delete({
      where: {
          id: task_id
      }
  })

  return task
}



const taskService = {
  get_task,
  create_task,
  update_task,
  delete_task
}

export default taskService