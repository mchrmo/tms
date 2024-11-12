import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import MeetingsItemsTable from "@/components/meetings/items/table"
import MeetingsTable from "@/components/meetings/table"
import Link from "next/link"

export default async function Meetings() {


  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Body z porád</ViewHeadline>
      </div>
      
      <MeetingsItemsTable></MeetingsItemsTable>
    </> 
  )
}

