import { meetingColumns, MeetingCreateSchema, MeetingUpdateSchema, ZMeetingCreateForm } from "@/lib/models/meeting/meeting.model"
import prisma from "@/lib/prisma"
import { getUser, isRole } from "@/lib/services/auth.service"
import meetingService, { meetingListItem } from "@/lib/services/meetings/meeting.service"
import { parseGetManyParams } from "@/lib/utils/api.utils"
import { Meeting, Prisma } from "@prisma/client"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { createPaginator } from "prisma-pagination"
import { Parser } from 'json2csv';
import { meetingItemStatusMap } from "@/lib/models/meeting/meetingItem.model"


const getMeeting = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)

  const user = await getUser()
  const user_id = user?.id || 0

  if (await isRole('admin', user)) {
    const meeting = await meetingService.get_meeting(id)
    if (!meeting) throw new ApiError(404, 'Not found')
  
    return NextResponse.json({
        role: "admin",
        data: meeting
      }, { status: 200 })
  }

  let items_where: Prisma.MeetingItemWhereInput = {}
  const attendant = await prisma.meetingAttendant.findUnique({
    where: {
      meeting_id_user_id: {meeting_id: id, user_id}
    }
  })
  if(!attendant) throw new ApiError(404, 'Not found')

  if (attendant.role == "ATTENDANT") {
    items_where = {
      OR: [
        {
          status: {
            notIn: ["PENDING", "DRAFT"]
          }
        },
        {
          creator_id: user_id
        }
      ]
    }
  }

  const meeting = await meetingService.get_meeting(id, { items_where })
  if (!meeting) throw new ApiError(404, 'Not found')


  return NextResponse.json({
    role: attendant.role,
    data: meeting
  }, { status: 200 })
}

const getMeetings = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const { where: paramsWhere, orderBy, pagination } = parseGetManyParams(params, meetingColumns)


  const user = await getUser()

  let where: Prisma.MeetingWhereInput = {
  }

  if (!await isRole('admin', user)) {
    where = {
      attendants: {
        some: {
          user_id: user?.id
        }
      }
    }
  }

  where = {
    ...paramsWhere,
    ...where
  }

  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  const data = await paginate<Meeting, Prisma.MeetingFindManyArgs>(
    prisma.meeting,
    {
      where,
      orderBy,
      include: meetingListItem.include,
    }
  )

  return NextResponse.json(data, { status: 200 })
}

const createMeeting = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = MeetingCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, { status: 400 });
  }


  const data: ZMeetingCreateForm = {
    ...parsedSchema.data
  }
  const meeting = await meetingService.create_meeting(data)


  return NextResponse.json(meeting, { status: 200 })
};

const updateMeeting = async (request: NextRequest) => {
  const body = await request.json()
  const parsedSchema = MeetingUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, { status: 400 });
  }


  const updateData = { ...parsedSchema.data }

  const meeting = await meetingService.update_meeting(updateData)


  return NextResponse.json(meeting, { status: 200 })

};

const deleteMeeting = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const meeting = await meetingService.delete_meeting(id)

  return NextResponse.json(meeting, { status: 200 })

}

const getCSV = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams

  const meeting_id = params.get('meeting')
  if(!meeting_id) return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 })

  try {
    // Fetch data from Prisma
    const data = await prisma.meetingItem.findMany({
      where: {meeting_id: parseInt(meeting_id), status: {not: {in: ['DENIED', 'DRAFT']}}},
      include: {
        creator: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        status: 'desc'
      }
    }); // Change `yourModel` to your actual model name

    data.forEach((item: any) => {
      item.status = meetingItemStatusMap[item.status]
    })

    // Convert JSON to CSV
    const json2csvParser = new Parser({fields: [
      {label: "Stav", value: 'status'},
      {label: 'Navrhovateľ', value: 'creator.name'},
      {label: "Popis", value: 'description'},
      {label: "Poznámka", default: '', value: 'poz'},
    ]});
    const csv = json2csvParser.parse(data);


    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=data.csv"`,
      },
    });

} catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json({ error: 'Chyba pri generovani vypisu' }, { status: 400 })
}

}

const meetingsController = {
  getMeeting,
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getCSV
}

export default meetingsController