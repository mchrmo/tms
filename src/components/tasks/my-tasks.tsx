
import { DATE_FORMAT } from "@/lib/utils"
import { Task } from "@prisma/client"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"
import TasksTable from "./table"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/db/user.repository"
import { getTaskList } from "@/lib/db/task.repository"
import AddButton from "../common/buttons/add-button"

export const fetchCache = 'force-no-store'

export default async function MyTasks() {
  const {userId} = auth()
  const user = await getUserByClerkId(userId!)
  const memberId = user?.OrganizationMember[0].id

  
  const myTasks = await getTaskList({
    assignee_id: memberId  
  })

  const createdTasks = await getTaskList({
    creator_id: memberId,
  })


  return (
    <div className="w-full p-5 space-y-8">

      <div>
        <h2 className="text-xl mb-2">Moje úlohy</h2>
        <TasksTable data={myTasks}></TasksTable>
      </div>
      

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl ">Sledované úlohy</h2>
          <Link href={'/tasks/create'}>
            <AddButton>Pridať</AddButton>
          </Link>
        </div>
        <TasksTable data={createdTasks}></TasksTable>
      </div>

    </div>
  )
}