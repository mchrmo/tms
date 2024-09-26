import { MeetingAttendantCreateSchema, ZMeetingAttendantCreateForm } from "@/lib/models/meeting/meetingAttendant.model";
import meetingAttendantService from "@/lib/services/meetings/meetingAttendant.service";
import { NextRequest, NextResponse } from "next/server"


const createMeetingAttendant = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = MeetingAttendantCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const data: ZMeetingAttendantCreateForm = {
    ...parsedSchema.data
  }
  const meetingAttendant = await meetingAttendantService.create_attendant(data)


  return NextResponse.json(meetingAttendant, { status: 200 })
};


const deleteMeetingAttendant = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const meetingAttendant = await meetingAttendantService.delete_attendant(id)  

  return NextResponse.json(meetingAttendant, { status: 200 })

}


const meetingAttendantsController = {
  createMeetingAttendant,
  deleteMeetingAttendant
}

export default meetingAttendantsController