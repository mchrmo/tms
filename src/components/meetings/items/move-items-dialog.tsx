"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMeetings } from "@/lib/hooks/meeting/meeting.hooks"
import { useMoveMeetingItems } from "@/lib/hooks/meeting/meetingItem.hooks"
import { formatDateTime } from "@/lib/utils/dates"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface MoveMeetingItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemIds: number[]
  sourceMeetingId: number
  onSuccess?: () => void
}

export default function MoveMeetingItemsDialog({
  open,
  onOpenChange,
  itemIds,
  sourceMeetingId,
  onSuccess,
}: MoveMeetingItemsDialogProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)

  const meetingsQ = useMeetings({ pageIndex: 0, pageSize: 100 }, undefined, undefined, false)

  useEffect(() => {
    if (open) {
      meetingsQ.refetch()
      setSelectedMeetingId(null)
    }
  }, [open])
  const moveItems = useMoveMeetingItems()

  const now = new Date()
  const upcomingMeetings = (meetingsQ.data?.data ?? []).filter(
    (m) => new Date(m.date) > now && m.id !== sourceMeetingId
  )

  const handleConfirm = () => {
    if (!selectedMeetingId) return
    moveItems.mutate(
      { item_ids: itemIds, target_meeting_id: selectedMeetingId },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Presunúť body do inej porady</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-2">
          Vybrané body ({itemIds.length}): presunúť do:
        </p>

        {meetingsQ.isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žiadne nadchádzajúce porady nie sú k dispozícii.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
            {upcomingMeetings.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMeetingId(m.id)}
                className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                  selectedMeetingId === m.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="font-medium">{m.name}</span>
                <span className="ml-2 text-muted-foreground">{formatDateTime(m.date)}</span>
              </button>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={moveItems.isPending}>
            Zrušiť
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMeetingId || moveItems.isPending}
          >
            {moveItems.isPending ? <LoadingSpinner /> : "Presunúť"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
