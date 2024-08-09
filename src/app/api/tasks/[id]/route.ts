import tasksController from "@/lib/controllers/tasks.controller";
import { getTask } from "@/lib/db/task.repository";
import { errorHandler } from "@/lib/services/api.service";
import { update_task } from "@/lib/services/task.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (request: NextRequest, { params }: { params: { id: string }}) => {

  const taskId = parseInt(params.id)

  // auth().protect()
  const task = await getTask(taskId)  

  return NextResponse.json(task, { status: 200 })
  
};

export const PATCH = errorHandler(tasksController.updateTask)
