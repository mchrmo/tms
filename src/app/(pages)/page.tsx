

import ViewHeadline from "@/components/common/view-haedline";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import EmpDashboard from "@/components/dashboard/emp-dashboard";
import { getUserRole, isRole } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export default  function Home() {

  const { sessionClaims } = auth()
  const isAdmin = isRole(sessionClaims, 'admin')

  
  

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
