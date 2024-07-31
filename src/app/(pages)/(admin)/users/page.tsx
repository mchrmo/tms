import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ViewHeadline from "@/components/common/view-haedline"
import Link from "next/link"
import AddButton from "@/components/common/buttons/add-button"
import { userRolesMap } from "@/models/User"
import { Separator } from "@/components/ui/separator"
import { getUserList } from "@/lib/db/user.repository"
import UsersTable from "@/components/users/table"


export default async function Users() {

  const users = await getUserList();
  
  
  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Užívatelia</ViewHeadline>
        <Link href={'/users/create'}>
          <AddButton>Pridať</AddButton>
        </Link>
      </div>
      <Separator/>

      <UsersTable></UsersTable>
    </>
  )
}