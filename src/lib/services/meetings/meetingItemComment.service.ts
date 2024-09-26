

import { Prisma, MeetingItemComment } from "@prisma/client";
import { getMember } from "../../db/organizations";
import { sendAssigneeChangeNotification } from "../mail.service";
import prisma from "../../prisma";
import userService from "../user.service";


type CreateMeetingItemCommentReqs = {
  message: string;
  item_id: number;
  creator_id: number;
}

const get_meetingItemComment = async (id: number) => {

  const meetingItemComment = await prisma.meetingItemComment.findUnique({
    where: {id},
    select: {
      id: true,
      message: true,
      createdAt: true,
      creator: {
        select: {name: true}
      },
    }
})

  return meetingItemComment
}
export type MeetingItemCommentDetail = Prisma.PromiseReturnType<typeof get_meetingItemComment>

const create_meetingItemComment = async (meetingItemCommentData: CreateMeetingItemCommentReqs) => {
  const meetingItemComment = await prisma.meetingItemComment.create({data: {...meetingItemCommentData}})
  
  return meetingItemComment
}

const update_meetingItemComment = async (meetingItemCommentData: Partial<MeetingItemComment>) => {

  if(!meetingItemCommentData.id) return null

  const id = meetingItemCommentData.id
  const meetingItemComment = await prisma.meetingItemComment.update({
    where: {id},
    data: meetingItemCommentData
  })

  return meetingItemComment
}

const delete_meetingItemComment = async (meetingItemComment_id: number) => {

  const meetingItemComment = await prisma.meetingItemComment.delete({where: {id: meetingItemComment_id}})

  return meetingItemComment
}


const meetingItemCommentService = {
  get_meetingItemComment,
  create_meetingItemComment,
  update_meetingItemComment,
  delete_meetingItemComment
}

export default meetingItemCommentService;