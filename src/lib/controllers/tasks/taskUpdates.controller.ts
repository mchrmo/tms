import { NextRequest, NextResponse } from "next/server";
import { paginate, parseFilter, parseQueryParams } from "../../services/api.service";
import { Prisma } from "@prisma/client";
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP, TaskUpdateSchema } from "../../models/task.model";
import { taskUpdateListItem } from "../../services/tasks/taskUpdate.service";




const getTaskUpdates = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {
    pagination: {page, pageSize},
    filters,
    order
  } = parseQueryParams(params)

  const where: Prisma.TaskUpdateWhereInput = parseFilter(filters, {task_id: 'number', description: 'string', id: 'number'})
  for (const [field, value] of Object.entries(filters)) {
    switch(field) {
    }
  }

  const data = await paginate({
    modelName: 'TaskUpdate',
    page,
    pageSize,
    where,
    orderBy: order,
    ...taskUpdateListItem as any 
  })
  

  return NextResponse.json(data, { status: 200 })
}



const taskUpdatesController = {
  getTaskUpdates
}

export default taskUpdatesController