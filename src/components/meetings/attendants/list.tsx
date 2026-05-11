'use client'
import { attendantsRolesMap } from "@/lib/models/meeting/meetingAttendant.model";
import { MeetingDetail } from "@/lib/services/meetings/meeting.service";
import MeetingAttendantForm from "./meeetingAttendant-form";
import { useDeleteMeetingAttendant } from "@/lib/hooks/meeting/meetingAttendant.hooks";
import ApplyGroupToMeeting from "./apply-group";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";


export default function MeetingAttendantsList({meeting}: {meeting: MeetingDetail}) {
  const [addOpen, setAddOpen] = useState(false)
  const deleteQuery = useDeleteMeetingAttendant()

  const onDelete = async (id: number) => {
    deleteQuery.mutate(id)
  }

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {meeting?.attendants.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{a.user.name}</h3>
                <div className="flex space-x-2">
                  <p className="text-sm text-gray-600">{attendantsRolesMap[a.role]}</p>
                  <p className="text-sm text-red-600 hover:text-red-800 cursor-pointer" onClick={() => onDelete(a.id)}>
                    Odstrániť
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" type="button" onClick={() => setAddOpen(true)} className="flex items-center gap-2">
          <UserPlus size={15} />
          Pridať účastníka
        </Button>
        <ApplyGroupToMeeting meeting_id={meeting?.id!} />
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pridať účastníka</DialogTitle>
          </DialogHeader>
          <MeetingAttendantForm meeting_id={meeting?.id!} onUpdate={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
