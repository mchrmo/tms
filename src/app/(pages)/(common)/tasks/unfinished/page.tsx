import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import TasksTable from "@/components/tasks/table"
import { isRole } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { id } from "date-fns/locale"
import Link from "next/link"


export default async function Tasks() {


    const user = await currentUser()
    const isAdmin = isRole(user, 'admin')

    return (
        <>
            <div className="flex items-center justify-between">
                <ViewHeadline>Nedokončené úlohy</ViewHeadline>
                
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

