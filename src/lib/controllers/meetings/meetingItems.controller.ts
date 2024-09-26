import { MeetingItemCreateSchema, MeetingItemStatusEnum, MeetingItemUpdateSchema, ZMeetingItemCreateForm, ZMeetingItemUpdateForm } from "@/lib/models/meeting/meetingItem.model"
import { MeetingItemCommentCreateSchema, ZMeetingItemCommentCreateForm } from "@/lib/models/meeting/meetingItemComment.model"
import prisma from "@/lib/prisma"
import meetingItemService from "@/lib/services/meetings/meetingItem.service"
import meetingItemCommentService from "@/lib/services/meetings/meetingItemComment.service"
import userService from "@/lib/services/user.service"
import { th } from "date-fns/locale"
import { waitForDebugger } from "inspector"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


const getMeetingItem = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)
  const meetingItem = await meetingItemService.get_meetingItem(id)  
  if(!meetingItem) throw new ApiError(404, 'Not found')
  
  return NextResponse.json(meetingItem, { status: 200 })
}

const createMeetingItem = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = MeetingItemCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const data: ZMeetingItemCreateForm = {
    ...parsedSchema.data
  }
  const meetingItem = await meetingItemService.create_meetingItem(data)


  return NextResponse.json(meetingItem, { status: 200 })
};

const updateMeetingItem = async (request: NextRequest) => {  
  const body = await request.json()
  const parsedSchema = MeetingItemUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }

  const updateData = {...parsedSchema.data}
  
  const item = await prisma.meetingItem.findUnique({where: {id: updateData.id}})
  if(!item) throw new ApiError(404, "Not found")
  
  if(item.status !== 'DRAFT') throw new ApiError(403, "Unable to edit published item")
  
  const updatedItem = await meetingItemService.update_meetingItem(updateData)
  return NextResponse.json(updatedItem, { status: 200 })
};

const publishMeetingItem = async (request: NextRequest) => {
  const body = await request.json()
  const parsedSchema = MeetingItemUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }
  

  const updateData: ZMeetingItemUpdateForm = {id: parsedSchema.data.id, status: "PENDING"}
  const item = await prisma.meetingItem.findUnique({where: {id: updateData.id}})
  if(!item) throw new ApiError(404, "Not found")
    if(item.status !== 'DRAFT') throw new ApiError(403, `Only draft can be published - now: ${item.status}`)

  const updatedItem = await meetingItemService.update_meetingItem(updateData)
  return NextResponse.json(updatedItem, { status: 200 })

}

const resolveMeetingItem = async (request: NextRequest) => {
  const body = await request.json()
  const parsedSchema = MeetingItemUpdateSchema.merge(z.object({ status: z.enum(['DENIED', 'ACCEPTED']) })).safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }

  const user = await userService.get_current_user()
  if(!user) throw new ApiError(404, "No user")

  const updateData: ZMeetingItemUpdateForm = {id: parsedSchema.data.id, status: parsedSchema.data.status}
  const item = await prisma.meetingItem.findUnique({where: {id: updateData.id}})
  if(!item) throw new ApiError(404, "Not found")

  if(item.status === 'DRAFT') throw new ApiError(403, `Draft cannot be resolved`)

  const updatingAttendant = await prisma.meetingAttendant.findMany({where: {meeting_id: item.meeting_id, role: "CREATOR", user_id: user.id}})
  if(!updatingAttendant.length) throw new ApiError(401, "Only creator can resolve item")

  const updatedItem = await meetingItemService.update_meetingItem(updateData)
  return NextResponse.json(updatedItem, { status: 200 })

}

const deleteMeetingItem = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const meetingItem = await meetingItemService.delete_meetingItem(id)  

  return NextResponse.json(meetingItem, { status: 200 })
}


const addComment = async (request: NextRequest) => {
  const body = await request.json()
  const parsedSchema = MeetingItemCommentCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }

  const user = await userService.get_current_user()
  if(!user) throw new ApiError(404, "No user")

  const data = {
    ...parsedSchema.data,
    creator_id: user.id!
  }
  const meetingItemComment = await meetingItemCommentService.create_meetingItemComment(data)


  return NextResponse.json(meetingItemComment, { status: 200 })
}

const deleteComment = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const meetingItemComment = await meetingItemCommentService.delete_meetingItemComment(id)  

  return NextResponse.json(meetingItemComment, { status: 200 })
}

const meetingItemsController = {
  getMeetingItem,
  createMeetingItem,
  updateMeetingItem,
  deleteMeetingItem,

  publishMeetingItem,
  resolveMeetingItem,

  addComment,
  deleteComment
}

export default meetingItemsController