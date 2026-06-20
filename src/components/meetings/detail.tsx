'use client'

import { useDeleteMeeting, useMeeting } from "@/lib/hooks/meeting/meeting.hooks"
import LoadingSpinner from "@/components/ui/loading-spinner"
import MeetingForm from "./meeting-form"
import MeetingAttendantsList from "./attendants/list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import clsx from "clsx"
import { useState } from "react"
import MeetingDetailItemsTable from "./items/detail-table"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ViewHeadline from "../common/view-haedline"

export default function MeetingDetail({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState('items')
  const router = useRouter()

  const meetingId = parseInt(params.id)
  const meetingQ = useMeeting(meetingId)
  const deleteMeeting = useDeleteMeeting(meetingId)

  const meeting = meetingQ.data && meetingQ.data.data
  const role = meetingQ.data?.role

  const canDelete = role === 'CREATOR'
  useEffect(() => {
    if (deleteMeeting.isSuccess) router.push('/meetings')
  }, [deleteMeeting.isSuccess])


  const downloadCSV = async () => {
    const response = await fetch('/api/meetings/csv?meeting=' + meetingId);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'porada.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Failed to download CSV');
    }
  };


  if (meetingQ.isLoading) return <span>Porada sa načitáva <LoadingSpinner></LoadingSpinner></span>

  return (
    <>

      <div className="flex justify-between items-end gap-4 mb-6">
        <div className="">
          <h1 className="text-2xl">Detail porady</h1>
        </div>
        {canDelete && (
          <div className="">
            <Button
              variant="linkDestructive"
              onClick={() => deleteMeeting.mutate()}
              disabled={deleteMeeting.isPending}
            >
              Vymazať poradu
            </Button>
          </div>
        )}
      </div>

      {meetingQ.error instanceof Error && <div>{meetingQ.error.message}</div>}

      {
        meeting && (
          <>
            <MeetingForm defaultValues={meeting} edit={true}></MeetingForm>


            <Tabs value={tab} onValueChange={setTab} className="">
              <TabsList className="flex gap-4">
                <TabsTrigger value="items" className={clsx({ 'border-b-3': tab == 'items', 'mb-1': tab !== 'items' })}>Program</TabsTrigger>
                <TabsTrigger value="attendants" className={clsx({ 'border-b-3': tab == 'attendants', 'mb-1': tab !== 'attendants' })}>Účastníci</TabsTrigger>
              </TabsList>
              {/* <div className="mt-5"> */}
              <TabsContent value="attendants">
                <MeetingAttendantsList meeting={meeting}></MeetingAttendantsList>
              </TabsContent>
              <TabsContent value="items">
                <MeetingDetailItemsTable meeting={meeting} role={meetingQ.data.role} onExport={downloadCSV} />
              </TabsContent>
              {/* </div> */}
            </Tabs>

          </>
        )
      }
    </>
  )
}

