
"use client";

import Link from "next/link"
import TasksTable from "./table"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/db/user.repository"
import { getTaskList } from "@/lib/db/task.repository"
import AddButton from "../common/buttons/add-button"
import { useMyTasks } from "@/lib/hooks/task.hooks"

export const fetchCache = 'force-no-store'

export default function MyTasks() {


  return (
    <div className="w-full p-5 space-y-8">
      <div>
        <h2 className="text-xl mb-2">Moje úlohy</h2>
        <MyAssignedTasks></MyAssignedTasks>
      </div>
    </div>
  )
}



function MyAssignedTasks() {

  
  const query = useMyTasks()


  return (
    <TasksTable query={query} ></TasksTable>
  )

}