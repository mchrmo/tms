import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import MeetingsTable from "@/components/meetings/table"
import Link from "next/link"

export default async function Meetings() {


  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Porady</ViewHeadline>

        <Link href={'/meetings/create'}>
          <AddButton>Nová porada</AddButton>
        </Link>
      </div>
      
      <MeetingsTable></MeetingsTable>
    </> 
  )
}

