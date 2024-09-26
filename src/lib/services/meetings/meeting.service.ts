import { Prisma, Meeting } from "@prisma/client";
import { getMember } from "../../db/organizations";
import { sendAssigneeChangeNotification } from "../mail.service";
import prisma from "../../prisma";
import userService from "../user.service";
import meetingAttendantService from "./meetingAttendant.service";
import { ApiError } from "next/dist/server/api-utils";


type CreateMeetingReqs = {
  name: string;
  date: string | Date;
}

export const meetingListItem = Prisma.validator<Prisma.MeetingDefaultArgs>()({
  include: {
    _count: {
      select: {
        attendants: true,
        items: {
          where: {
            status: {
              not: "DRAFT"
            }
          }
        }
      }
    }
  }
})
export type MeetingListItem = Prisma.MeetingGetPayload<typeof meetingListItem>


const get_meeting = async (id: number) => {

  const meeting = await prisma.meeting.findUnique({
    where: {id},
    include: {
      attendants: {
        select: {
          id: true,
          user: {select: {name: true}},
          role: true
        }
      },
      items: {
        select: {
          id: true,
          description: true,
          creator: {select: {name: true}},
          status: true
        }
      }
    },
    
  })

  return meeting
}
export type MeetingDetail = Prisma.PromiseReturnType<typeof get_meeting>

const create_meeting = async (meetingData: CreateMeetingReqs) => {

  const user = await userService.get_current_user()
  if(!user) throw new ApiError(403, "No user")

  const meeting = await prisma.meeting.create({data: meetingData})
  const creator = await meetingAttendantService.create_attendant({meeting_id: meeting.id, user_id: user.id, role: 'CREATOR'})
  
  return meeting
}

const update_meeting = async (meetingData: Partial<Meeting>) => {

  if(!meetingData.id) return null

  const id = meetingData.id
  const meeting = await prisma.meeting.update({
    where: {id},
    data: meetingData
  })


  return meeting
}

const delete_meeting = async (meeting_id: number) => {

 
  const items = await prisma.meetingItem.deleteMany({
      where: {
        meeting_id,
      },
  })

  const metadata = await prisma.meetingMeta.deleteMany({
    where: {
      meeting_id
    }
  })

  const meeting = await prisma.meeting.delete({
      where: {
          id: meeting_id
      }
  })

  return meeting
}


const meetingService = {
  get_meeting,
  create_meeting,
  update_meeting,
  delete_meeting
}

export default meetingService;