'use client'

import { useUser } from "@/lib/hooks/user.hooks"
import ViewHeadline from "../common/view-haedline"
import LoadingSpinner from "../ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { USER_ROLES_MAP } from "@/lib/models/user.model"
import ChangeUserPasswordModal from "./change-password.modal"

export default function ProfileDetail({userId, canEdit}: {userId: number, canEdit?: boolean}) {

  
  const userQ = useUser(userId)
  const user = userQ.data

  return (
    <>
      <ViewHeadline>Profil</ViewHeadline>

      {userQ.error instanceof Error && <div>{userQ.error.message}</div>}
      {userQ.isLoading && <span>Profil sa načitáva <LoadingSpinner></LoadingSpinner></span> }

      {
        user && (

          // <table className="table table-auto">
          //     <tbody>
          //     <tr>
          //       <th>Meno</th>
          //       <td>{user.name}</td>
          //     </tr>
          //     </tbody>
          // </table>

          <Table className="w-[400px]">
        <TableBody>
          <TableRow className="hover:bg-white">
            <TableHead>Meno:</TableHead>
            <TableCell className="font-bold">{user.name}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-white">
            <TableHead>Email.:</TableHead>
            <TableCell className="font-medium">{user.email}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-white">
            <TableHead>Telefón:</TableHead>
            <TableCell className="font-medium">{user.phone}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-white">
            <TableHead>Rola:</TableHead>
            <TableCell className="font-medium">{USER_ROLES_MAP[user.role.name]}</TableCell>
          </TableRow>
          {
            canEdit && (
            <TableRow className="hover:bg-white" >
              <TableHead>Heslo:</TableHead>
              <TableCell className="font-medium">
                <ChangeUserPasswordModal userId={userId}/>
              </TableCell>
            </TableRow>
            )
          }
          
          {
            user.OrganizationMember[0] && (
              <TableRow className="hover:bg-white">
              <TableHead>Organizácia:</TableHead>
                <TableCell className="font-medium">
                  <Link className="link" href={'/organizations/members/'+user.OrganizationMember[0].id}>{user.OrganizationMember[0].organization.name}</Link>
                </TableCell>
            </TableRow>
            )
          }
        </TableBody>
      </Table>


        )
      }

    </>
  )
}

