import { getTask } from "@/lib/db/task.repository"
import { getUser } from "@/lib/db/user.repository"
import prisma from "@/lib/prisma"
import { AuthUser, getAllSuperierors, isSuperior } from "@/lib/services/auth.service"
import { newMeetingAttendantEmail } from "@/lib/services/mail.service"
import meetingService from "@/lib/services/meetings/meeting.service"
import { errorHandler } from "@/lib/services/api.service"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"





  export const GET = errorHandler(async ( req ) => {

    const params = req.nextUrl.searchParams
    
    const task_id = parseInt(params.get("task_id")!)
    const user_id = parseInt(params.get("user_id")!)

    const meeting = await meetingService.get_meeting(4)
    const email = newMeetingAttendantEmail(7, meeting!)    
    // const task = await taskService.get_task(task_id)
    // if(!task) return NextResponse.json({"message": "Task"})


    // const user = (await getUser(user_id) as unknown) as AuthUser
    // if(!user) return NextResponse.json({"message": "User"})


    // const relationship = await taskRelService.checkTaskRelationship(task, user)

    // const res = await taskRelService.update_taskRel(task_id, user_id, relationship)


    return NextResponse.json({})
  })

