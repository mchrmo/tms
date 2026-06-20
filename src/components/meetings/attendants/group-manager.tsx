'use client'

import { useState } from "react"
import {
  useAttendantGroups,
  useCreateAttendantGroup,
  useUpdateAttendantGroup,
  useDeleteAttendantGroup,
  useAddGroupMember,
  useRemoveGroupMember,
} from "@/lib/hooks/meeting/meetingAttendantsGroup.hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SubmitButton from "@/components/common/buttons/submit"
import OrganizationMemberCombobox from "@/components/organizations/members/member-combobox"
import { AttendantGroupWithMembers } from "@/lib/services/meetings/meetingAttendantsGroup.service"
import { ChevronDown, ChevronUp, Edit2, LoaderCircleIcon, Trash2, UserPlus, X } from "lucide-react"

function GroupMemberRow({ member, groupId }: {
  member: AttendantGroupWithMembers['MeetingAttendantsGroupUser'][number]
  groupId: number
}) {
  const remove = useRemoveGroupMember(groupId)
  return (
    <li className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50">
      <span className="text-sm">{member.user.name}</span>
      <button
        onClick={() => remove.mutate(member.user_id)}
        disabled={remove.isPending}
        className="text-gray-400 hover:text-red-500 p-1 rounded disabled:opacity-40"
        title="Odstrániť"
      >
        {remove.isPending
          ? <LoaderCircleIcon size={12} className="animate-spin" />
          : <X size={12} />}
      </button>
    </li>
  )
}

function GroupRow({ group }: { group: AttendantGroupWithMembers }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(group.name)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const updateGroup = useUpdateAttendantGroup()
  const deleteGroup = useDeleteAttendantGroup()
  const addMember = useAddGroupMember(group.id)

  const handleRename = () => {
    if (newName.trim() && newName !== group.name) {
      updateGroup.mutate({ id: group.id, name: newName.trim() }, {
        onSuccess: () => setEditing(false)
      })
    } else {
      setEditing(false)
    }
  }

  const handleDelete = () => {
    if (!confirm(`Naozaj chcete vymazať skupinu "${group.name}"?`)) return
    deleteGroup.mutate(group.id)
  }

  const handleAddMember = () => {
    if (!selectedUserId) return
    addMember.mutate(selectedUserId, {
      onSuccess: () => { setAddOpen(false); setSelectedUserId(null) }
    })
  }

  return (
    <div className="border rounded-lg mb-3 bg-white shadow-sm">
      <div className="flex items-center justify-between p-3">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setEditing(false); setNewName(group.name) } }}
              autoFocus
              className="h-8 max-w-xs"
            />
            <SubmitButton onClick={handleRename} isLoading={updateGroup.isPending} type="button" className="h-8 text-xs px-3">Uložiť</SubmitButton>
            <Button size="sm" variant="secondary" className="text-xs" onClick={() => { setEditing(false); setNewName(group.name) }}>Zrušiť</Button>
          </div>
        ) : (
          <button className="font-semibold flex-1 text-left" onClick={() => setExpanded(v => !v)}>
            {group.name}
            <span className="ml-2 text-xs text-gray-500">({group.MeetingAttendantsGroupUser.length})</span>
          </button>
        )}

        <div className="flex items-center gap-1 ml-2">
          {!editing && (
            <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Premenovať">
              <Edit2 size={14} />
            </button>
          )}
          <button onClick={handleDelete} disabled={deleteGroup.isPending} className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-40" title="Vymazať skupinu">
            {deleteGroup.isPending ? <LoaderCircleIcon size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
          <button onClick={() => setExpanded(v => !v)} className="p-1 text-gray-400 hover:text-gray-700 rounded">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-3 pb-3 pt-2">
          {group.MeetingAttendantsGroupUser.length === 0 ? (
            <p className="text-sm text-gray-400 mb-2">Skupina je prázdna</p>
          ) : (
            <ul className="mb-2 divide-y divide-gray-100">
              {group.MeetingAttendantsGroupUser.map(m => (
                <GroupMemberRow key={m.id} member={m} groupId={group.id} />
              ))}
            </ul>
          )}
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="flex items-center gap-1 text-xs">
            <UserPlus size={13} /> Pridať člena
          </Button>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={open => { if (!open) { setAddOpen(false); setSelectedUserId(null) } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pridať člena — {group.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <OrganizationMemberCombobox
              label="Vybrať osobu"
              onSelectResult={member => setSelectedUserId(member.user_id)}
            />
            <SubmitButton
              isLoading={addMember.isPending}
              onClick={handleAddMember}
              type="button"
              disabled={!selectedUserId}
            >
              Pridať
            </SubmitButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AttendantGroupManager() {
  const groupsQ = useAttendantGroups()
  const createGroup = useCreateAttendantGroup()
  const [newGroupName, setNewGroupName] = useState('')

  const handleCreate = () => {
    if (!newGroupName.trim()) return
    createGroup.mutate(newGroupName.trim(), {
      onSuccess: () => setNewGroupName('')
    })
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <Input
          placeholder="Názov novej skupiny"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
          className="max-w-xs"
        />
        <SubmitButton onClick={handleCreate} isLoading={createGroup.isPending} disabled={!newGroupName.trim()} type="button">
          Vytvoriť skupinu
        </SubmitButton>
      </div>

      {groupsQ.isLoading && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <LoaderCircleIcon size={14} className="animate-spin" /> Načítavam skupiny...
        </p>
      )}
      {!groupsQ.isLoading && groupsQ.data?.length === 0 && (
        <p className="text-sm text-gray-400">Zatiaľ nemáte žiadne skupiny</p>
      )}
      {groupsQ.data?.map(group => (
        <GroupRow key={group.id} group={group} />
      ))}
    </div>
  )
}

