
import UserDetail from "@/components/users/detail";

export default async function User({ params }: {params: {id: string}}) {
  

  return (
    <>
      <UserDetail params={params}></UserDetail>
    </>
  )
}

