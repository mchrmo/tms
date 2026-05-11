'use client'

import { useState } from "react"
import { useAttendantGroups, useApplyGroupToMeeting } from "@/lib/hooks/meeting/meetingAttendantsGroup.hooks"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoaderCircleIcon, Users } from "lucide-react"

export default function ApplyGroupToMeeting({ meeting_id }: { meeting_id: number }) {
  const [open, setOpen] = useState(false)
  const [applyingId, setApplyingId] = useState<number | null>(null)
  const groupsQ = useAttendantGroups()
  const applyGroup = useApplyGroupToMeeting()

  const handleApply = (groupId: number) => {
    setApplyingId(groupId)
    applyGroup.mutate({ groupId, meeting_id }, {
      onSettled: () => setApplyingId(null),
      onSuccess: () => setOpen(false),
    })
  }

  const groups = groupsQ.data ?? []

  return (
    <>
      <Button variant="outline" type="button" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Users size={15} />
        Pridať skupinu
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Vybrať skupinu účastníkov</DialogTitle>
          </DialogHeader>

          {groupsQ.isLoading && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <LoaderCircleIcon size={14} className="animate-spin" /> Načítavam...
            </p>
          )}
          {!groupsQ.isLoading && groups.length === 0 && (
            <p className="text-sm text-gray-400">Nemáte žiadne skupiny</p>
          )}

          <ul className="space-y-2">
            {groups.map(group => {
              const isApplying = applyingId === group.id
              return (
                <li key={group.id}>
                  <button
                    onClick={() => handleApply(group.id)}
                    disabled={applyGroup.isPending}
                    className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 flex items-center justify-between disabled:opacity-50"
                  >
                    <div>
                      <span className="font-medium text-sm">{group.name}</span>
                      <span className="ml-2 text-gray-400 text-xs">
                        {group.MeetingAttendantsGroupUser.length} čl.
                      </span>
                    </div>
                    {isApplying && <LoaderCircleIcon size={14} className="animate-spin text-gray-400" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
