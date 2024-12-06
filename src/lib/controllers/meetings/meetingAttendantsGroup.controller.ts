import { MeetingAttendantsGroupCreateSchema, MeetingAttendantsGroupUpdateSchema, ZMeetingAttendantsGroupCreateForm } from "@/lib/models/meeting/meetingAttendantsGroup.model";
import meetingAttendantService from "@/lib/services/meetings/meetingAttendant.service";
import meetingAttendantsGroupService from "@/lib/services/meetings/meetingAttendantsGroup.service";
import { NextRequest, NextResponse } from "next/server"


const createMeetingAttendantsGroup = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = MeetingAttendantsGroupCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const data: ZMeetingAttendantsGroupCreateForm = {
    ...parsedSchema.data
  }
  const meetingAttendant = await meetingAttendantsGroupService.create_attendantGroup(data)


  return NextResponse.json(meetingAttendant, { status: 200 })
};

const updateMeetingAttendantsGroup = async (request: NextRequest) => {
    const body = await request.json()
    const parsedSchema = MeetingAttendantsGroupUpdateSchema.safeParse(body);
  
    if (!parsedSchema.success) {
      const { errors } = parsedSchema.error;
  
      return NextResponse.json({
        error: { message: "Invalid request", errors },
      }, { status: 400 });
    }
  
    const updateData = { ...parsedSchema.data }
    const meeting = await meetingAttendantsGroupService.update_attendantGroup(updateData)
  
  
    return NextResponse.json(meeting, { status: 200 })
  
};

const deleteMeetingAttendantsGroup = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const meetingAttendant = await meetingAttendantService.delete_attendant(id)  

  return NextResponse.json(meetingAttendant, { status: 200 })
}


const meetingAttendantsGroupController = {
    createMeetingAttendantsGroup,
    deleteMeetingAttendantsGroup,
    updateMeetingAttendantsGroup
}

export default meetingAttendantsGroupController