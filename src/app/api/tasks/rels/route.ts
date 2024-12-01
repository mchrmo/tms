import prisma from "@/lib/prisma";
import { errorHandler } from "@/lib/services/api.service";
import taskService from "@/lib/services/tasks/task.service";
import taskRelService from "@/lib/services/tasks/taskRelationship.service";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";


export const POST = errorHandler(async (req) => {
  const body = await req.json()
  if (!body.taskId) throw new ApiError(400, "Missing taskId")

  const task = await prisma.task.findUnique({
    where: { id: body.taskId },
    include: {
      creator: true,
      assignee: true
    }
  })

  if(!task) throw new ApiError(404, "")

  await taskRelService.update_allTaskRelationships(task)

  return NextResponse.json({ status: 200 })
})
