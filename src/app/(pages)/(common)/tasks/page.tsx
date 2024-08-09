import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import Organization from "@/components/organizations/organization"
import TasksTable from "@/components/tasks/table"
import TaskForm from "@/components/tasks/task-form"
import { getMainOrganization } from "@/lib/db/organizations"
import { getTaskList } from "@/lib/db/task.repository"
import { isRole } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"


export default async function Tasks() {


  const { sessionClaims } = auth()
  const isAdmin = isRole(sessionClaims, 'admin')



  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Úlohy</ViewHeadline>

        {!isAdmin && 
        <Link href={'/tasks/create'}>
          <AddButton>Pridať</AddButton>
        </Link>
        }
      </div>

      <TasksTable />
    </>
  )
}

