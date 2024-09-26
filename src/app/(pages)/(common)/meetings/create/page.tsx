import AddButton from "@/components/common/buttons/add-button";
import ViewHeadline from "@/components/common/view-haedline";
import CreateMeeting from "@/components/meetings/create";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CreateMeetingPage() {

  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Nová porada</ViewHeadline>

        <Link href={'/meetings'}>
          <Button variant={'secondary'}>Späť na porady</Button>
        </Link>
      </div>

      <div>
        <CreateMeeting></CreateMeeting>
      </div>

    </>
  )
}

