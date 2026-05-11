import { meetingItemColumns, MeetingItemCreateSchema, MeetingItemStatusEnum, MeetingItemUpdateSchema, ZMeetingItemCreateForm, ZMeetingItemUpdateForm } from "@/lib/models/meeting/meetingItem.model"
import { MeetingItemCommentCreateSchema, ZMeetingItemCommentCreateForm } from "@/lib/models/meeting/meetingItemComment.model"
import prisma from "@/lib/prisma"
import { getUser, isRole } from "@/lib/services/auth.service"
import meetingItemService, { meetingItemListItem } from "@/lib/services/meetings/meetingItem.service"
import meetingItemCommentService from "@/lib/services/meetings/meetingItemComment.service"
import userService from "@/lib/services/user.service"
import { parseGetManyParams } from "@/lib/utils/api.utils"
import { MeetingItem, Prisma } from "@prisma/client"
import { id, th } from "date-fns/locale"
import { waitForDebugger } from "inspector"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { createPaginator } from "prisma-pagination"
import { z } from "zod"




const getMeetingItems = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {where: paramsWhere, orderBy, pagination} = parseGetManyParams(params, meetingItemColumns)

  const user = await getUser()

  let where: Prisma.MeetingItemWhereInput = {
    
  }

  if(!await isRole('admin', user)) {
    where = {
      meeting: {
        attendants: {
          some: {
            user_id: user?.id
          }
        }
      }
    }
  }
  
  where = {
    ...paramsWhere,
    ...where,
    ...{status: {notIn: ["DRAFT"]}}
  }
  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  const data = await paginate<MeetingItem, Prisma.MeetingItemFindManyArgs>(
    prisma.meetingItem,
    {
      where,
      orderBy,
      include: meetingItemListItem.include,
    }
  )

  return NextResponse.json(data, { status: 200 })
}

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
  
  // if(item.status !== 'DRAFT') throw new ApiError(403, "Unable to edit published item")
  
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

  // const updatingAttendant = await prisma.meetingAttendant.findMany({where: {meeting_id: item.meeting_id, role: "CREATOR", user_id: user.id}})
  // if(!updatingAttendant.length) throw new ApiError(401, "Only creator can resolve item")

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

const moveMeetingItems = async (request: NextRequest) => {
  const body = await request.json()

  const schema = z.object({
    item_ids: z.array(z.number().int().positive()).min(1, "Musíte vybrať aspoň jeden bod"),
    target_meeting_id: z.number().int().positive()
  })

  const parsedSchema = schema.safeParse(body)
  if (!parsedSchema.success) {
    return NextResponse.json({ error: { message: "Invalid request", errors: parsedSchema.error.errors } }, { status: 400 })
  }

  const { item_ids, target_meeting_id } = parsedSchema.data

  const user = await getUser()
  if (!user) throw new ApiError(401, "Neautorizovaný")

  const admin = await isRole('admin', user)

  // Verify all items come from the same source meeting and user is CREATOR of it (or admin)
  const items = await prisma.meetingItem.findMany({ where: { id: { in: item_ids } } })
  if (items.length !== item_ids.length) throw new ApiError(404, "Niektoré body porady neboli nájdené")

  const sourceMeetingIds = Array.from(new Set(items.map(i => i.meeting_id)))
  if (sourceMeetingIds.length > 1) throw new ApiError(400, "Všetky body musia patriť tej istej porade")

  const sourceMeetingId = sourceMeetingIds[0]

  if (!admin) {
    const attendant = await prisma.meetingAttendant.findUnique({
      where: { meeting_id_user_id: { meeting_id: sourceMeetingId, user_id: user.id } }
    })
    if (!attendant || attendant.role !== 'CREATOR') {
      throw new ApiError(403, "Len vlastník porady alebo admin môže presúvať body")
    }
  }

  // Verify target meeting exists and hasn't happened yet
  const targetMeeting = await prisma.meeting.findUnique({ where: { id: target_meeting_id } })
  if (!targetMeeting) throw new ApiError(404, "Cieľová porada nebola nájdená")
  if (new Date(targetMeeting.date) <= new Date()) throw new ApiError(400, "Cieľová porada už prebehla")
  if (targetMeeting.id === sourceMeetingId) throw new ApiError(400, "Zdrojová a cieľová porada sú rovnaké")

  const result = await meetingItemService.move_meetingItems(item_ids, target_meeting_id)
  return NextResponse.json(result, { status: 200 })
}

const meetingItemsController = {
  getMeetingItem,
  getMeetingItems,
  createMeetingItem,
  updateMeetingItem,
  deleteMeetingItem,

  publishMeetingItem,
  resolveMeetingItem,
  moveMeetingItems,

  addComment,
  deleteComment
}

export default meetingItemsController