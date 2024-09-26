import ViewHeadline from "@/components/common/view-haedline";
import MeetingDetail from "@/components/meetings/detail";

export default async function MeetingPage({ params }: {params: {id: string}}) {

  return (
    <>
      <ViewHeadline>Detail porady</ViewHeadline>
      <MeetingDetail params={params}></MeetingDetail>
    </>
  )
}

