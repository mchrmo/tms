import ViewHeadline from "@/components/common/view-haedline";
import MeetingDetail from "@/components/meetings/detail";

export default async function MeetingPage({ params }: {params: {id: string}}) {

  return (
    <>
      <MeetingDetail params={params}></MeetingDetail>
    </>
  )
}

