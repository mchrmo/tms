'use client'

import LoadingSpinner from "@/components/ui/loading-spinner"
import { useState } from "react"
import UserRegistrationForm from "./registration-form"
import { useUser } from "@/lib/hooks/user.hooks"
import ViewHeadline from "../common/view-haedline"
import UnavailabilityForm from "./unavailability-form"

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

            <div className="mt-8 max-w-screen-sm">
              <h2 className="text-xl mb-2">Dočasná nedostupnosť</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Nastavte obdobie, počas ktorého bude užívateľ nedostupný. Ostatní uvidia upozornenie pri výbere tejto osoby.
              </p>
              <UnavailabilityForm
                userId={userId}
                unavailable_from={user.data.unavailable_from}
                unavailable_to={user.data.unavailable_to}
              />
            </div>
          </>
        )
      }
    </>
  )
}

