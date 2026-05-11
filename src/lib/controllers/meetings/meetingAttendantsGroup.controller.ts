import { MeetingAttendantsGroupCreateSchema, MeetingAttendantsGroupUpdateSchema, ZMeetingAttendantsGroupCreateForm } from "@/lib/models/meeting/meetingAttendantsGroup.model";
import meetingAttendantsGroupService from "@/lib/services/meetings/meetingAttendantsGroup.service";
import userService from "@/lib/services/user.service";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";
import meetingAttendantService from "@/lib/services/meetings/meetingAttendant.service";


const getMeetingAttendantsGroups = async (request: NextRequest) => {
  const user = await userService.get_current_user()
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 })

  const groups = await meetingAttendantsGroupService.get_userGroups(user.id)
  return NextResponse.json(groups, { status: 200 })
}

const createMeetingAttendantsGroup = async (request: NextRequest) => {

  const user = await userService.get_current_user()
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 })

  const body = await request.json()
  const parsedSchema = MeetingAttendantsGroupCreateSchema.safeParse({ ...body, creator_id: user.id });

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const data: ZMeetingAttendantsGroupCreateForm = { ...parsedSchema.data }
  const group = await meetingAttendantsGroupService.create_attendantGroup(data)

  return NextResponse.json(group, { status: 200 })
};

const updateMeetingAttendantsGroup = async (request: NextRequest) => {
  const body = await request.json()
  const parsedSchema = MeetingAttendantsGroupUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    return NextResponse.json({ error: { message: "Invalid request", errors } }, { status: 400 });
  }

  const group = await meetingAttendantsGroupService.update_attendantGroup(parsedSchema.data)
  return NextResponse.json(group, { status: 200 })
};

const deleteMeetingAttendantsGroup = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const group = await meetingAttendantsGroupService.delete_attendantGroup(id)
  return NextResponse.json(group, { status: 200 })
}

const AddGroupMemberSchema = z.object({ user_id: z.number().int().positive() })

const addGroupMember = async (request: NextRequest, params: any) => {
  const group_id = parseInt(params.id)
  const body = await request.json()
  const parsed = AddGroupMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid request", errors: parsed.error.errors } }, { status: 400 })
  }

  const member = await meetingAttendantsGroupService.add_groupAttendant({ group_id, user_id: parsed.data.user_id })
  return NextResponse.json(member, { status: 200 })
}

const removeGroupMember = async (req: NextRequest, params: any) => {
  const group_id = parseInt(params.id)
  const user_id = parseInt(params.userId)
  const result = await meetingAttendantsGroupService.remove_groupAttendant(user_id, group_id)
  return NextResponse.json(result, { status: 200 })
}

const applyGroupToMeeting = async (request: NextRequest, params: any) => {
  const group_id = parseInt(params.id)
  const body = await request.json()
  const { meeting_id } = body

  if (!meeting_id) {
    return NextResponse.json({ error: { message: "meeting_id is required" } }, { status: 400 })
  }

  const group = await import("@/lib/prisma").then(m =>
    m.default.meetingAttendantsGroup.findUnique({
      where: { id: group_id },
      include: { MeetingAttendantsGroupUser: true }
    })
  )

  if (!group) return NextResponse.json({ error: { message: "Group not found" } }, { status: 404 })

  const results = await Promise.allSettled(
    group.MeetingAttendantsGroupUser.map(u =>
      meetingAttendantService.create_attendant({ meeting_id, user_id: u.user_id })
    )
  )

  const added = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ added }, { status: 200 })
}


const meetingAttendantsGroupController = {
  getMeetingAttendantsGroups,
  createMeetingAttendantsGroup,
  deleteMeetingAttendantsGroup,
  updateMeetingAttendantsGroup,
  addGroupMember,
  removeGroupMember,
  applyGroupToMeeting,
}

export default meetingAttendantsGroupController