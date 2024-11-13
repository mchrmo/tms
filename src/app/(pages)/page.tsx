

import AdminDashboard from "@/components/dashboard/admin-dashboard";
import EmpDashboard from "@/components/dashboard/emp-dashboard";
import { getUser } from "@/lib/services/auth.service";


export default async function Home() {

  const user = await getUser()
  let isAdmin = false


  if(user) {
    if(user.role.name == 'admin') isAdmin = true
  }
  

  
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
