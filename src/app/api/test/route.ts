import { getTask } from "@/lib/db/task.repository"
import { getUser } from "@/lib/db/user.repository"
import prisma from "@/lib/prisma"
import { AuthUser, getAllSuperierors, isSuperior } from "@/lib/services/auth.service"
import taskService from "@/lib/services/tasks/task.service"
import taskRelService from "@/lib/services/tasks/taskRelationship.service"
import { errorHandler } from "@/lib/utils/api.utils"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"





  export const GET = errorHandler(async ( req ) => {

    const params = req.nextUrl.searchParams
    
    const task_id = parseInt(params.get("task_id")!)
    const user_id = parseInt(params.get("user_id")!)


    const allTasks = await prisma.task.findMany({include: {assignee: true, creator: true}})
    for (const task of allTasks) {
      await taskRelService.update_allTaskRelationships(task)    
    }
    
    // const task = await taskService.get_task(task_id)
    // if(!task) return NextResponse.json({"message": "Task"})


    // const user = (await getUser(user_id) as unknown) as AuthUser
    // if(!user) return NextResponse.json({"message": "User"})


    // const relationship = await taskRelService.checkTaskRelationship(task, user)

    // const res = await taskRelService.update_taskRel(task_id, user_id, relationship)


    return NextResponse.json({})
  })

