

import { Prisma, MeetingItem } from "@prisma/client";
import { sendAssigneeChangeNotification } from "../mail.service";
import prisma from "../../prisma";
import userService from "../user.service";


type CreateMeetingItemReqs = {
  description: string;
  status: 'DRAFT' | 'PENDING' | 'DENIED' | 'ACCEPTED' | 'PASSED';
  meeting_id: number;
}

export const meetingItemListItem = Prisma.validator<Prisma.MeetingItemDefaultArgs>()({
  include: {
    meeting: {
      select: {
        name: true,
        date: true
      }
    }
  }
})
export type MeetingItemListItem = Prisma.MeetingItemGetPayload<typeof meetingItemListItem>

const get_meetingItem = async (id: number) => {

  const meetingItem = await prisma.meetingItem.findUnique({
    where: {id},
    include: {
      meeting: {
        select: {
          name: true
        }
      },
      comments: {
        select: {
          id: true,
          message: true,
          createdAt: true,
          creator: {
            select: {name: true}
          },
        }
      }
    }
  })

  return meetingItem
}
export type MeetingItemDetail = Prisma.PromiseReturnType<typeof get_meetingItem>

const create_meetingItem = async (meetingItemData: CreateMeetingItemReqs) => {

  const user = await userService.get_current_user()
  if(!user) return null



  const meetingItem = await prisma.meetingItem.create({data: {creator_id: user.id, ...meetingItemData}})
  
  return meetingItem
}

const update_meetingItem = async (meetingItemData: Partial<MeetingItem>) => {

  if(!meetingItemData.id) return null

  const id = meetingItemData.id
  const { id: _id, ...rest } = meetingItemData
  const data = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined))

  const meetingItem = await prisma.meetingItem.update({
    where: {id},
    data
  })


  return meetingItem
}

const delete_meetingItem = async (meetingItem_id: number) => {
  const comments = await prisma.meetingItemComment.deleteMany({where: {item_id: meetingItem_id}})

  const meetingItem = await prisma.meetingItem.delete({where: {id: meetingItem_id}})

  return meetingItem
}

const move_meetingItems = async (itemIds: number[], targetMeetingId: number) => {
  const updatedItems = await prisma.meetingItem.updateMany({
    where: { id: { in: itemIds } },
    data: { meeting_id: targetMeetingId }
  })
  return updatedItems
}


const meetingItemService = {
  get_meetingItem,
  create_meetingItem,
  update_meetingItem,
  delete_meetingItem,
  move_meetingItems
}

export default meetingItemService;