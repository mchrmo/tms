

import Filter from "@/components/common/table/filter";
import ViewHeadline from "@/components/common/view-haedline";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import EmpDashboard from "@/components/dashboard/emp-dashboard";
import { getUserRole, isRole } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Home() {

  const user = await currentUser()
  const isAdmin = isRole(user, 'admin')

  
  

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
