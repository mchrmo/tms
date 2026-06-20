import { Prisma, Meeting, MeetingAttendantRole } from "@prisma/client";
import { sendEmail, sendMeetingUpdatedEmail, sendMeetingDeletedEmail } from "../mail.service";
import prisma from "../../prisma";
import userService from "../user.service";
import meetingAttendantService from "./meetingAttendant.service";
import { ApiError } from "next/dist/server/api-utils";
import { MeetingUserRole } from "@/lib/models/meeting/meeting.model";
import { formatDate, formatDateTime } from "@/lib/utils/dates";


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


const get_meeting = async (id: number, options?: {items_where: Prisma.MeetingItemWhereInput}) => {

  let role: MeetingAttendantRole | undefined = undefined;

  let where = {id}
  let itemsWhere: Prisma.MeetingItemWhereInput = (options && options.items_where) || {}


  const meeting = await prisma.meeting.findUnique({
    where,
    include: {
      attendants: {
        select: {
          id: true,
          user: {select: {name: true}},
          role: true
        }
      },
      items: {
        where: itemsWhere,
        select: {
          id: true,
          description: true,
          creator: {select: {name: true}},
          status: true,
          title: true,
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

  const originalMeeting = await prisma.meeting.findUnique({
    where: {id},
    include: {
      attendants: {
        select: {
          user: true
        }
      }
    }
  })
  if(!originalMeeting) return null

  const meeting = await prisma.meeting.update({
    where: {id},
    data: meetingData
  })

  // notify attendants on any meeting change
  const dateChanged = meetingData.date && new Date(meetingData.date).getTime() !== new Date(originalMeeting.date).getTime()
  const nameChanged = meetingData.name && meetingData.name !== originalMeeting.name
  if (dateChanged || nameChanged) {
    for (const attendant of originalMeeting.attendants) {
      await sendMeetingUpdatedEmail(attendant.user.email, meeting)
    }
  }



  return meeting
}

const delete_meeting = async (meeting_id: number) => {

  const meetingWithAttendants = await prisma.meeting.findUnique({
    where: { id: meeting_id },
    include: {
      attendants: {
        select: { user: { select: { email: true } } }
      }
    }
  })

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

  const attendants = await prisma.meetingAttendant.deleteMany({
    where: {
      meeting_id
    }
  })


  const meeting = await prisma.meeting.delete({
      where: {
          id: meeting_id
      }
  })

  if (meetingWithAttendants) {
    for (const attendant of meetingWithAttendants.attendants) {
      await sendMeetingDeletedEmail(attendant.user.email, meeting)
    }
  }

  return meeting
}


const meetingService = {
  get_meeting,
  create_meeting,
  update_meeting,
  delete_meeting
}

export default meetingService;