'use client'

import LoadingSpinner from "@/components/ui/loading-spinner"
import { useState } from "react"
import UserRegistrationForm from "./registration-form"
import { useUser } from "@/lib/hooks/user.hooks"
import ViewHeadline from "../common/view-haedline"

export default function UserDetail({ params }: {params: {id: string}}) {

  const userId = parseInt(params.id)
  const user = useUser(userId)

  if(user.isLoading) return <span>Užívateľ sa načitáva <LoadingSpinner></LoadingSpinner></span> 
  
  return (
    <>

      <ViewHeadline>Detail užívateľa</ViewHeadline>

      {user.error instanceof Error && <div>{user.error.message}</div>}

      {
        user.data && (
          <>  
            <UserRegistrationForm defaultValues={user.data} ></UserRegistrationForm>
          </>
        )
      }
    </>
  )
}

