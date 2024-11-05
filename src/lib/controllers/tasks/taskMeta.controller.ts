import taskMetaService from "@/lib/services/tasks/taskMeta.service"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


const taskSchema = z.object({
  taskId: z.number(),
  key: z.string(),
  value: z.string()
})


const addTaskMeta = async (req: NextRequest, params: any) => {
  const body = await req.json()

  const parsedSchema = taskSchema.safeParse(body)
  if(!parsedSchema.success) {
    throw new ApiError(400, "Nesprávne údaje")
  }
  
  const {taskId, key, value} = parsedSchema.data
  const meta = await taskMetaService.add_meta(taskId, key, value)
  
  return NextResponse.json(meta, { status: 200 })
}

const deleteTaskMeta = async (req: NextRequest, params: any) => {

  let taskId = parseInt(req.nextUrl.searchParams.get('taskId') || '')
  let key = req.nextUrl.searchParams.get('key')
  if(!key || !taskId) throw new ApiError(400, "Nesprávna požiadavka")


  await taskMetaService.remove_meta(taskId, key)

  return NextResponse.json(null, {status: 200})

}

const taskMetaController = {
  addTaskMeta,
  deleteTaskMeta
}

export default taskMetaController