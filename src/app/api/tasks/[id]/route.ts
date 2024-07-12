import { getTask } from "@/lib/db/task.repository";
import { update_task } from "@/lib/services/task.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (request: NextRequest, { params }: { params: { id: string }}) => {

  const taskId = parseInt(params.id)

  // auth().protect()
  const task = await getTask(taskId)  

  return NextResponse.json(task, { status: 200 })
  
};

export const PATCH = async (request: NextRequest) => {

  
  const schema = z.object({
    id: z.number(),
    name: z.string().optional(),
    description: z.string().optional(),
    deadline: z.coerce.date().optional(),
    assignee_id: z.number().optional(),
    priority: z.enum(['LOW', 'MEDIUM', "HIGH", "CRITICAL"]).optional(),
    parent_id: z.number().or(z.null()).optional(),
    status: z.enum(['TODO', 'WAITING', 'INPROGRESS', 'CHECKREQ', 'DONE']).optional(),
  });

  
  const body = await request.json()
  const parsedSchema = schema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  const task = await update_task(updateData)


  return NextResponse.json(task, { status: 200 })
  
};