'use client'

import LoadingSpinner from "@/components/ui/loading-spinner"
import MeetingItemForm from "./item-form"
import { useDeleteMeetingItem, useMeetingItem, usePublishMeetingItem, useResolveMeetingItem } from "@/lib/hooks/meeting/meetingItem.hooks"
import ViewHeadline from "@/components/common/view-haedline"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { useAuth } from "@clerk/nextjs"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import MeetingItemCommentsOverview from "./comments/comment-overview"
import MeetingItemCommentForm from "./comments/comment-form"
import { useEffect } from "react"

export default function MeetingItemDetail({ params }: {params: {id: string}}) {

  const itemId = parseInt(params.id)
  const meetingItem = useMeetingItem(itemId)
  const router = useRouter()
  
  const resolveItemQ = useResolveMeetingItem(itemId)
  const deleteItemQ = useDeleteMeetingItem(itemId)
  const publishItemQ = usePublishMeetingItem(itemId)

  const acceptItem = () => {
    resolveItemQ.mutate({id: itemId, status: 'ACCEPTED'})
  }

  const denyItem = () => {
    resolveItemQ.mutate({id: itemId, status: 'DENIED'})
  }

  const deleteItem = () => {
    deleteItemQ.mutate()
  }

  const publishItem = () => {
    publishItemQ.mutate()
  }

  const backToMeeting = () => {
    router.push(`/meetings/${meetingItem.data?.meeting_id}`)
  }

  useEffect(() => {

    if(resolveItemQ.isSuccess || publishItemQ.isSuccess || deleteItemQ.isSuccess) {
      backToMeeting()
    }

  }, [resolveItemQ.isSuccess, publishItemQ.isSuccess, deleteItemQ.isSuccess])


  if(meetingItem.isLoading) return <span>Detail sa načitáva <LoadingSpinner></LoadingSpinner></span> 
  
  if(meetingItem.error instanceof Error) return <div>{meetingItem.error.message}</div>
  if(!meetingItem.data) return <span>Žiadne dáta</span> 


  return (
    <>
      
      <Link className="flex link" href={`/meetings/${meetingItem.data?.meeting_id}`}>
          <ChevronLeft></ChevronLeft>
          Späť na poradu
      </Link>
      <div className="flex items-center justify-between">
        <ViewHeadline>{meetingItem.data.meeting.name} - Návrh bodu porady</ViewHeadline>
        <div className="flex space-x-4">
          {
            meetingItem.data.status == 'DRAFT' && <Button onClick={publishItem}>Publikovať</Button>
          }
          {
            meetingItem.data.status == 'PENDING' && (
                <>
                  <Button variant={'default'} onClick={acceptItem}>Schváliť</Button>
                  <Button variant={'secondary'} onClick={denyItem}>Zamietnuť</Button>
                </>
          )
          }
          <Button variant={'secondary'} onClick={deleteItem}>Vymazať</Button>
        </div>
      </div>
      <MeetingItemForm defaultValues={meetingItem.data} edit={true}></MeetingItemForm>


      <MeetingItemCommentsOverview comments={meetingItem.data.comments}></MeetingItemCommentsOverview>
      <MeetingItemCommentForm defaultValues={{item_id: meetingItem.data.id}}></MeetingItemCommentForm>
    </>
  )
}

