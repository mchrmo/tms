import AddButton from "@/components/common/buttons/add-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import MeetingItemForm from "./item-form"

export default function CreateMeetingItem({meeting_id}: {meeting_id: number}) {

  const [isForm, setIsForm] = useState(false)

  return (
    <>
        <AddButton onClick={() => setIsForm(true)}>Pridať návrh</AddButton>

        <Dialog open={isForm} onOpenChange={setIsForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pridať návrh bodu porady</DialogTitle>
              <DialogDescription>
                
              </DialogDescription>
            </DialogHeader>
            <MeetingItemForm defaultValues={{meeting_id}} onCancel={() => {
                  setIsForm(false)
                }}></MeetingItemForm>
          </DialogContent>
        </Dialog>

      
    
    </>
  )
}