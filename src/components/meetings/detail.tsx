'use client'

import { useMeeting } from "@/lib/hooks/meeting/meeting.hooks"
import LoadingSpinner from "@/components/ui/loading-spinner"
import MeetingForm from "./meeting-form"
import MeetingAttendantsList from "./attendants/list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import clsx from "clsx"
import { useState } from "react"
import CreateMeetingItem from "./items/create"
import MeetingDetailItemsTable from "./items/detail-table"

export default function MeetingDetail({ params }: {params: {id: string}}) {
  const [tab, setTab] = useState('items')

  const meetingId = parseInt(params.id)
  const meetingQ = useMeeting(meetingId)

  const meeting = meetingQ.data && meetingQ.data.data

  if(meetingQ.isLoading) return <span>Porada sa načitáva <LoadingSpinner></LoadingSpinner></span> 
  
  return (
    <>

      {meetingQ.error instanceof Error && <div>{meetingQ.error.message}</div>}

      {
        meeting && (
          <>  
            <MeetingForm defaultValues={meeting} edit={true}></MeetingForm>
            

            <Tabs value={tab} onValueChange={setTab}  className="">
              <TabsList className="flex gap-4">
                <TabsTrigger value="items" className={clsx({'border-b-3': tab == 'items', 'mb-1': tab !== 'items'})}>Program</TabsTrigger>
                <TabsTrigger value="attendants" className={clsx({'border-b-3': tab == 'attendants', 'mb-1': tab !== 'attendants'})}>Účastníci</TabsTrigger>
              </TabsList>
              {/* <div className="mt-5"> */}
                <TabsContent value="attendants">
                  <MeetingAttendantsList meeting={meeting}></MeetingAttendantsList>
                </TabsContent>
                <TabsContent value="items">
                  <div className="flex">
                    <div className="ms-auto">
                    <CreateMeetingItem meeting_id={meeting.id} ></CreateMeetingItem>
                    </div>
                  </div>
                  <MeetingDetailItemsTable meeting={meeting} role={meetingQ.data.role}></MeetingDetailItemsTable>
                </TabsContent>
              {/* </div> */}
            </Tabs>

          </>
        )
      }
    </>
  )
}

