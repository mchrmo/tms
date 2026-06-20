"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateMeeting, useMeetings } from "@/lib/hooks/meeting/meeting.hooks"
import { useMoveMeetingItems } from "@/lib/hooks/meeting/meetingItem.hooks"
import { formatDateTime, formatDateTimeHtml } from "@/lib/utils/dates"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface MoveMeetingItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemIds: number[]
  sourceMeetingId: number
  onSuccess?: () => void
}

type Mode = "existing" | "new"

export default function MoveMeetingItemsDialog({
  open,
  onOpenChange,
  itemIds,
  sourceMeetingId,
  onSuccess,
}: MoveMeetingItemsDialogProps) {
  const [mode, setMode] = useState<Mode>("existing")
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)
  const [newName, setNewName] = useState("")
  const [newDate, setNewDate] = useState(formatDateTimeHtml(new Date()))

  const meetingsQ = useMeetings({ pageIndex: 0, pageSize: 100 }, undefined, undefined, false)
  const moveItems = useMoveMeetingItems()
  const createMeeting = useCreateMeeting()

  useEffect(() => {
    if (open) {
      meetingsQ.refetch()
      setSelectedMeetingId(null)
      setMode("existing")
      setNewName("")
      setNewDate(formatDateTimeHtml(new Date()))
    }
  }, [open])

  const now = new Date()
  const upcomingMeetings = (meetingsQ.data?.data ?? []).filter(
    (m) => new Date(m.date) > now && m.id !== sourceMeetingId
  )

  const isPending = moveItems.isPending || createMeeting.isPending

  const handleConfirm = () => {
    if (mode === "existing") {
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
    } else {
      if (!newName.trim() || !newDate) return
      createMeeting.mutate(
        { name: newName.trim(), date: new Date(newDate) },
        {
          onSuccess: (createdMeeting) => {
            moveItems.mutate(
              { item_ids: itemIds, target_meeting_id: createdMeeting.id },
              {
                onSuccess: () => {
                  onOpenChange(false)
                  onSuccess?.()
                },
              }
            )
          },
        }
      )
    }
  }

  const canConfirm = mode === "existing"
    ? !!selectedMeetingId
    : !!newName.trim() && !!newDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Presunúť body do porady</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Vybrané body ({itemIds.length}): presunúť do:
        </p>

        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "existing" ? "default" : "outline"}
            onClick={() => setMode("existing")}
          >
            Existujúca porada
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "new" ? "default" : "outline"}
            onClick={() => setMode("new")}
          >
            Nová porada
          </Button>
        </div>

        {mode === "existing" ? (
          meetingsQ.isLoading ? (
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
          )
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-meeting-name">Názov porady</Label>
              <Input
                id="new-meeting-name"
                placeholder="Názov porady"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-meeting-date">Dátum a čas</Label>
              <Input
                id="new-meeting-date"
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Zrušiť
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || isPending}>
            {isPending ? <LoadingSpinner /> : "Presunúť"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
