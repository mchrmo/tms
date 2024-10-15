import ProfileDetail from "@/components/profile/profile-detail";

export default async function ProfilePage({ params }: {params: {id?: string}}) {


  return (
    <>
      <ProfileDetail userId={parseInt(params.id!)}></ProfileDetail>
    </>
  )
}

