import ProfileDetail from "@/components/profile/profile-detail"
import { getUserByClerkId } from "@/lib/db/user.repository"
import { auth } from "@clerk/nextjs/server"

export default async function CurrentProfilePage() {

  const clerkUser = auth()
  const user = clerkUser.userId ? await getUserByClerkId(clerkUser.userId) : null

  if(!user) return <span>Žiadny profil užívateľa sa nenašiel</span>

  return (
    <>
      <ProfileDetail userId={user.id} canEdit={true}></ProfileDetail>
    </>
  )
}

