import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import Organization from "@/components/organizations/organization-overview"
import TasksTable from "@/components/tasks/table"
import TaskForm from "@/components/tasks/task-form"
import { isRole } from "@/lib/utils"
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from "next/link"


export default async function Tasks() {


  const user = await currentUser()
  const isAdmin = isRole(user, 'admin')



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

