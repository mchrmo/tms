import { Prisma, OrganizationMember } from "@prisma/client";
import prisma from "../../prisma";
import taskService from "../tasks/task.service";
import taskUpdateService from "../tasks/taskUpdate.service";


type CreateOrganizationMemberReqs = {
  user_id: number,
  manager_id: number | null,
  organization_id: number,
  position_name: string
}

export const organizationMemberListItem = Prisma.validator<Prisma.OrganizationMemberDefaultArgs>()({
  include: {
    user: {
      select: {name: true}
    },
    organization: {
      select: {name: true}
    },
  }
})
export type OrganizationMemberListItem = Prisma.OrganizationMemberGetPayload<typeof organizationMemberListItem>


const get_organizationMember = async (id: number) => {

  const organizationMember = await prisma.organizationMember.findUnique({
    where: {id},
    include: {
      user: {
        select: {name: true}
      },
      organization: {
        select: {name: true}
      },
      manager: {
        select: {user: {select: {name: true}}, id: true}
      },
      subordinates: {
        select: {
          id: true,
          organization: {
            select: {name: true}
          },
          user: {
            select: {name: true}
          },
          position_name: true,
        }
      }
    },
  })

  return organizationMember
}
export type OrganizationMemberDetail = Exclude<Prisma.PromiseReturnType<typeof get_organizationMember>, null>

const create_organizationMember = async (organizationMemberData: CreateOrganizationMemberReqs) => {
  const data: Prisma.OrganizationMemberUncheckedCreateInput = {...organizationMemberData}
  const organizationMember = await prisma.organizationMember.create({data})
  return organizationMember
}


const update_organizationMember = async (organizationMemberData: Partial<OrganizationMember>) => {

  if(!organizationMemberData.id) return null

  const id = organizationMemberData.id
  const organizationMember = await prisma.organizationMember.update({
    where: {id},
    data: organizationMemberData
  })


  return organizationMember
}

const swap_organizationMember = async (orgMember_id: number, newUser_id: number) => {

  // Zmena zodpovednej 
  const organizationMember = await prisma.organizationMember.update({
    where: {id: orgMember_id},
    data: {
      user_id: newUser_id
    }
  })

  const assignedTasks = await prisma.task.findMany({
    where: {assignee_id: orgMember_id}
  })
  for (const task of assignedTasks) {
    await taskUpdateService.create_taskUpdate(task, null, 'assignee_id', newUser_id)
  }

  const createTask = await prisma.task.findMany({
    where: {assignee_id: orgMember_id}
  })
  for (const task of assignedTasks) {
    await taskUpdateService.create_taskUpdate(task, null, 'assignee_id', newUser_id)
  }


}

const delete_organizationMember = async (orgMember_id: number, newOwner_id: number) => {

  // Nie je možné odstrániť člena, ktorý je nadriadený iným členom
  const subordinates = await prisma.organizationMember.count({where: {manager_id: orgMember_id}})
  if(subordinates) throw new Error("Nie je možné odstrániť člena, ktorý je nadriadený iným členom")

  // Zmena zodpovednej osoby (ZO.) na vlastníka na úlohách kde je člen ZO.
  const assignedTasks = await prisma.task.findMany({
    where: {assignee_id: orgMember_id}
  })
  for (const task of assignedTasks) {
    await taskService.update_task({id: task.id, assignee_id: task.creator_id})
  }

  // Zmena vlastníka na určeného člena na úlohách kde je člen vlastník.
  const ownedTasks = await prisma.task.findMany({
    where: {creator_id: orgMember_id}
  })
  
  for (const task of ownedTasks) {
    await taskService.update_task({id: task.id, creator_id: newOwner_id})
  }

  // Vymazanie člena
  const organizationMember = await prisma.organizationMember.delete({
      where: {
          id: orgMember_id
      }
  })

  return organizationMember
}


const organizationMemberService = {
  get_organizationMember,
  create_organizationMember,
  update_organizationMember,
  delete_organizationMember
}

export default organizationMemberService;