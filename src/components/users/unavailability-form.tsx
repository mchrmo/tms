'use client'

import { useState } from "react"
import { useUpdateUser } from "@/lib/hooks/user.hooks"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { isUserUnavailable } from "@/lib/utils/unavailability"
import { AlertTriangle, X } from "lucide-react"

interface UnavailabilityFormProps {
  userId: number
  unavailable_from?: Date | null
  unavailable_to?: Date | null
}

export default function UnavailabilityForm({ userId, unavailable_from, unavailable_to }: UnavailabilityFormProps) {
  const updateUser = useUpdateUser(userId)

  const isCurrentlyActive = isUserUnavailable(unavailable_from, unavailable_to)

  const [fromDate, setFromDate] = useState<Date | undefined>(
    unavailable_from ? new Date(unavailable_from) : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    unavailable_to ? new Date(unavailable_to) : undefined
  )

  const isDirty =
    (fromDate?.toISOString() ?? null) !== (unavailable_from ? new Date(unavailable_from).toISOString() : null) ||
    (toDate?.toISOString() ?? null) !== (unavailable_to ? new Date(unavailable_to).toISOString() : null)

  const handleSave = () => {
    updateUser.mutate({
      id: userId,
      unavailable_from: fromDate ?? null,
      unavailable_to: toDate ?? null,
    })
  }

  const handleClear = () => {
    setFromDate(undefined)
    setToDate(undefined)
    updateUser.mutate({
      id: userId,
      unavailable_from: null,
      unavailable_to: null,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {isCurrentlyActive && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
          <AlertTriangle size={14} className="shrink-0" />
          <span>Momentálne ste nastavený ako nedostupný</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex flex-col gap-1 w-full sm:w-48">
          <span className="text-xs text-muted-foreground">Od</span>
          <DatePicker date={fromDate as Date} setDate={setFromDate} />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-48">
          <span className="text-xs text-muted-foreground">Do</span>
          <DatePicker date={toDate as Date} setDate={setToDate} />
        </div>
      </div>

      <div className="flex gap-2">
        {isDirty && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateUser.isPending || (!fromDate && !toDate) || (!!fromDate && !!toDate && fromDate > toDate)}
          >
            {updateUser.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Uložiť
          </Button>
        )}
        {(unavailable_from || unavailable_to) && !isDirty && (
          <Button size="sm" variant="ghost" onClick={handleClear} disabled={updateUser.isPending}>
            <X size={14} className="mr-1" />
            Zrušiť nedostupnosť
          </Button>
        )}
      </div>
    </div>
  )
}
