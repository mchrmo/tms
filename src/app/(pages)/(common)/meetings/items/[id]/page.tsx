import ViewHeadline from "@/components/common/view-haedline";
import MeetingItemDetail from "@/components/meetings/items/detail";

export default async function MeetingItemPage({ params }: {params: {id: string}}) {

  return (
    <>
      <MeetingItemDetail params={params}></MeetingItemDetail>
    </>
  )
}
