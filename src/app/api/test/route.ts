import { getTaskRelationship } from "@/lib/controllers/tasks/tasks.controller"
import { getTask } from "@/lib/db/task.repository"
import { getUser } from "@/lib/db/user.repository"
import { AuthUser, isHierachicalyAbove } from "@/lib/services/auth.service"
import taskService from "@/lib/services/tasks/task.service"
import { errorHandler } from "@/lib/utils/api.utils"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"





  export const GET = errorHandler(async ( req ) => {

    const params = req.nextUrl.searchParams
    
    const task_id = params.get("task_id") as string
    const user_id = params.get("user_id") as string

    const task = await taskService.get_task(parseInt(task_id!))
    if(!task) return NextResponse.json({"message": "Task"})

    const user = (await getUser(parseInt(user_id)) as unknown) as AuthUser

    const relationship = await getTaskRelationship(task, user)

    return NextResponse.json({relationship})
  })

