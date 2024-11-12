'use client'

import { useMeeting } from "@/lib/hooks/meeting/meeting.hooks"
import LoadingSpinner from "@/components/ui/loading-spinner"
import MeetingForm from "./meeting-form"
import MeetingAttendantsList from "./attendants/list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import clsx from "clsx"
import { useState } from "react"
import AddButton from "../common/buttons/add-button"
import MeetingItemForm from "./items/item-form"
import CreateMeetingItem from "./items/create"
import MeetingDetailItemsTable from "./items/detail-table"

export default function MeetingDetail({ params }: {params: {id: string}}) {
  const [tab, setTab] = useState('items')

  const meetingId = parseInt(params.id)
  const meeting = useMeeting(meetingId)

  if(meeting.isLoading) return <span>Porada sa načitáva <LoadingSpinner></LoadingSpinner></span> 
  
  return (
    <>

      {meeting.error instanceof Error && <div>{meeting.error.message}</div>}

      {
        meeting.data && (
          <>  
            <MeetingForm defaultValues={meeting.data} edit={true}></MeetingForm>
            

            <Tabs value={tab} onValueChange={setTab}  className="">
              <TabsList className="flex gap-4">
                <TabsTrigger value="items" className={clsx({'border-b-3': tab == 'items', 'mb-1': tab !== 'items'})}>Program</TabsTrigger>
                <TabsTrigger value="attendants" className={clsx({'border-b-3': tab == 'attendants', 'mb-1': tab !== 'attendants'})}>Účastníci</TabsTrigger>
              </TabsList>
              {/* <div className="mt-5"> */}
                <TabsContent value="attendants">
                  <MeetingAttendantsList meeting={meeting.data}></MeetingAttendantsList>
                </TabsContent>
                <TabsContent value="items">
                  <div className="flex">
                    <div className="ms-auto">
                    <CreateMeetingItem meeting_id={meeting.data.id} ></CreateMeetingItem>
                    </div>
                  </div>
                  <MeetingDetailItemsTable meeting={meeting.data}></MeetingDetailItemsTable>
                </TabsContent>
              {/* </div> */}
            </Tabs>

          </>
        )
      }
    </>
  )
}

