import { Prisma, Task, TaskUserRole } from "@prisma/client"
import { AuthUser, getAllSuperierors, getMembership, getUser, isSuperior } from "../auth.service"
import taskService, { TaskDetail } from "./task.service"
import prisma from "@/lib/prisma"


export type TaskWithUsers = Prisma.TaskGetPayload<{
  include: {assignee: {
    select: {user_id: true}
  },
  creator: {
    select: {user_id: true}
  }};
}>;


const checkTaskRelationship = async (task: TaskWithUsers, user: AuthUser): Promise<null | TaskUserRole> => {
  const membership = await getMembership(user.id)

  if (!membership) return null

  if ((task?.assignee_id == task?.creator_id) && (task?.assignee_id == membership?.id)) {
    return 'PERSONAL'
  }

  if (task?.assignee_id == membership?.id) return 'ASSIGNEE'
  if (task?.creator_id == membership?.id) return 'OWNER'

  const isSuperiorToCreator = await isSuperior(membership?.id, task?.creator_id!)
  if (isSuperiorToCreator) return 'VIEWER'

  const isSuperiorToAssignee = await isSuperior(membership?.id, task?.creator_id!)
  if (isSuperiorToAssignee) return 'VIEWER'

  return null
}


const update_allTaskRelationships = async (task: Exclude<TaskWithUsers, null>) => {

  // Get all affected users = (onwer + superiors) + (assignee + superiors) 

  const affectedUserIds: Set<number> = new Set([])

  if(task.assignee) {
    affectedUserIds.add(task.assignee?.user_id)

    const assigneeSuperiors = await getAllSuperierors(task.assignee?.user_id)
    assigneeSuperiors.forEach(m => affectedUserIds.add(m.user_id))
  }

  if(task.creator) {
    affectedUserIds.add(task.creator?.user_id!)

    const ownerSuperiors = await getAllSuperierors(task.creator?.user_id!)
    ownerSuperiors.forEach(m => affectedUserIds.add(m.user_id))
  }
  
  const affectedUserIdsArr = Array.from(affectedUserIds)

  // Delete relations if user_id not in the list
  await prisma.taskRelationship.deleteMany({
    where: {
      task_id: task.id,
      user_id: {
        notIn: affectedUserIdsArr
      }
    }
  })


  for (const user_id of affectedUserIdsArr) {
    await update_taskRelationship(task.id, user_id)
  }
  

} 


const update_taskRelationship = async (task_id: number, user_id: number, relationship?: TaskUserRole | null) => {

  if (relationship === undefined) {
    const task = await taskService.get_task(task_id)
    if (!task) return

    const user = await getUser({ user_id })
    if (!user) return

    relationship = await checkTaskRelationship(task, user)
  }

  if (relationship === null) {
    // Remove all with no relationship
    await prisma.taskRelationship.deleteMany({
      where: {
        task_id,
        user_id,
      }
    })

  } else if (relationship) {
    await prisma.taskRelationship.upsert({
      where: {
        user_id_task_id: {
          user_id,
          task_id,
        }
      },
      update: {
        role: relationship
      },
      create: {
        user_id,
        task_id,
        role: relationship,
      },
    })
  }



}


const taskRelService = {
  checkTaskRelationship,
  update_allTaskRelationships,
  update_taskRelationship,
}

export default taskRelService