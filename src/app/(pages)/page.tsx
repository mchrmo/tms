

import SendReportButton from "@/components/common/buttons/sendReportButton";
import Filter from "@/components/common/table/filter";
import ViewHeadline from "@/components/common/view-haedline";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import EmpDashboard from "@/components/dashboard/emp-dashboard";
import { getUserRole, isRole } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import { useUser } from "../providers";


export default async function Home({user}: {user: User}) {

  // const user = await currentUser()
  // const userContext = useUser();

  const isAdmin = true

  
  return (
    <>
      {
        isAdmin ? 
          <AdminDashboard></AdminDashboard>
          :
          <EmpDashboard></EmpDashboard>
      }

    </>
  );
}
