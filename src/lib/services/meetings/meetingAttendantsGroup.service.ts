import { ZMeetingAttendantsGroupUpdateForm } from "@/lib/models/meeting/meetingAttendantsGroup.model";
import prisma from "@/lib/prisma";

interface CreateAttendantGroupReqs {
  creator_id: number;
  name: string;
}

const create_attendantGroup = async (groupData: CreateAttendantGroupReqs) => {
  const group = await prisma.meetingAttendantsGroup.create({
    data: groupData
  })

  return group
}

const update_attendantGroup = async ({name, id}: ZMeetingAttendantsGroupUpdateForm) => {
  const group = await prisma.meetingAttendantsGroup.updateMany({
    where: {
      id
    },
    data: {
      name
    }
  })

  return group
}


const delete_attendantGroup = async (id: number) => {

  let group = await prisma.meetingAttendantsGroup.findUnique({where: {id}})
  if(!group) return null

  await prisma.meetingAttendantsGroupUser.deleteMany({where: {group_id: id}})
  await prisma.meetingAttendantsGroup.delete({where: {id}})

  return group
}


interface AddGroupAttendantReqs {
  group_id: number,
  user_id: number
}
const add_groupAttendant = async (userData: AddGroupAttendantReqs) => {

  const user = await prisma.meetingAttendantsGroupUser.upsert({
    create: {
      group_id: userData.group_id,
      user_id: userData.user_id
  },
    update: {},
    where: {
      group_id_user_id: {
        group_id: userData.group_id,
        user_id: userData.user_id
      }
    }
  })

  return user
}

const remove_groupAttendant = async (user_id: number, group_id: number) => {

  const user = await prisma.meetingAttendantsGroupUser.deleteMany({
    where: {
      user_id,
      group_id,
    }
  })

  return user
}


const meetingAttendantsGroupService = {
  create_attendantGroup,
  update_attendantGroup,
  delete_attendantGroup,

  add_groupAttendant,
  remove_groupAttendant
}

export default meetingAttendantsGroupService