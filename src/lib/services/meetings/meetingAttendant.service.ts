import { User } from "@prisma/client";
import userService from "../user.service";
import prisma from "@/lib/prisma";
import { ApiError } from "next/dist/server/api-utils";
import { newMeetingAttendantEmail } from "../mail.service";


interface CreateAttendantReqs {
  user_id: number;
  meeting_id: number;
  role?: 'ATTENDANT' | 'CREATOR'
}

const create_attendant = async (attendantData: CreateAttendantReqs) => {

  const exists = await prisma.meetingAttendant.findMany({where: {user_id: attendantData.user_id, meeting_id: attendantData.meeting_id}})
  if(exists.length) throw new ApiError(403, "Already between attendants")

  const newAttendant = await prisma.meetingAttendant.create({data: {...attendantData}})
  if(newAttendant) {
    const meeting = await prisma.meeting.findUnique({where: {id: newAttendant.meeting_id}})
    await newMeetingAttendantEmail(newAttendant.user_id, meeting?.name!, meeting?.date!)
  }

  return newAttendant
}

const delete_attendant = async (id: number) => {

  let attendant = await prisma.meetingAttendant.findUnique({where: {id}})

  if(!attendant) return null
  if(attendant?.role == 'CREATOR') throw new ApiError(403, "Unable to delete creator") 

  attendant = await prisma.meetingAttendant.delete({where: {id}})

  return attendant
}

const meetingAttendantService = {
  create_attendant,
  delete_attendant
}

export default meetingAttendantService