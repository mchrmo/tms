import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import { TasksTable } from "@/components/tasks/table"
import { isRole } from "@/lib/utils"
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from "next/link"


export default async function Tasks() {

  const user = await currentUser()
  const isAdmin = isRole(user, 'admin')

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <ViewHeadline>Úlohy</ViewHeadline>

        {!isAdmin &&
          <Link href={'/tasks/create'}>
            <AddButton>Pridať</AddButton>
          </Link>
        }
      </div>
      <TasksTable
        // defaultFilters={
        //   [
        //     {
        //       id: 'status',
        //       value: 'TODO,INPROGRESS'
        //     }
        //   ]
        // }

      />
    </div>
  )


}

