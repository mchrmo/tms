
"use client";
import TasksTable from "./table"

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



  return (
    <TasksTable ></TasksTable>
  )

}