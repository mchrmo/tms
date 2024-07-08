import { User, clerkClient } from "@clerk/nextjs/server"
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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import AddButton from "@/components/common/buttons/add-button"
import { userRolesMap } from "@/models/User"
import { Separator } from "@/components/ui/separator"
import { getUserList } from "@/lib/db/user.repository"


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


      <Table>
        <TableCaption>Prehľad systémových užívateľov.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Meno</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Rola</TableHead>
            <TableHead>Organizácia</TableHead>
            <TableHead>ClerkID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            users.map((u) => 
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{userRolesMap[u.role.name]}</TableCell>
                <TableCell>{u.OrganizationMember.length ? u.OrganizationMember[0].organization.name : ''}</TableCell>
                <TableCell>{u.clerk_id}</TableCell>
                {/* <TableCell>
                  <button>Text</button>
                </TableCell> */}
              </TableRow>
            )

          }
        </TableBody>
      </Table>

    </>
  )
}