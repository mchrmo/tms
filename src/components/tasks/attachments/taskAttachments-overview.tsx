import { TaskDetail } from "@/lib/services/tasks/task.service";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils/dates";
import { DownloadIcon, TrashIcon } from "lucide-react";
import TaskAttachmentsUpload from "./taskAttachments-upload";
import { useDeleteTaskAttachment } from "@/lib/hooks/task/task.hooks";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";


export default function TaskAttachmentsOverview({ task }: { task: TaskDetail }) {
  const deleteAttachmentQ = useDeleteTaskAttachment(task?.id!)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const attachments = task?.attachments ?? []
  const allSelected = attachments.length > 0 && selected.size === attachments.length

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(attachments.map(a => a.id)))
    }
  }

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkDownload = async () => {
    const selectedAttachments = attachments.filter(a => selected.has(a.id))

    if (selectedAttachments.length === 1) {
      const a = selectedAttachments[0]
      const link = document.createElement('a')
      link.href = `/api/files?file=${encodeURIComponent(a.file.path)}&name=${encodeURIComponent(a.file.name)}`
      link.download = a.file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    const selectedFiles = selectedAttachments
      .map(a => ({ path: a.file.path, name: a.file.name }))

    const response = await fetch('/api/files/zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: selectedFiles }),
    })

    if (!response.ok) return

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prilohy.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg">Prílohy</h3>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="outline" size="sm" onClick={handleBulkDownload}>
              <DownloadIcon size={14} className="mr-1" />
              Stiahnuť ({selected.size})
            </Button>
          )}
          <TaskAttachmentsUpload task={task} />
        </div>
      </div>
      <div className="mt-5">
        <Table>
          <TableCaption>Zoznam pripojených súborov.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Vybrať všetky"
                />
              </TableHead>
              <TableHead>Názov</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Vlastník</TableHead>
              <TableHead>Dátum pridania</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {attachments.map((attachment) => (
              <TableRow key={attachment.id} data-state={selected.has(attachment.id) ? 'selected' : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(attachment.id)}
                    onCheckedChange={() => toggleOne(attachment.id)}
                    aria-label={`Vybrať ${attachment.file.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{attachment.file.name}</TableCell>
                <TableCell>{attachment.file.extension}</TableCell>
                <TableCell>{attachment.file.owner.name}</TableCell>
                <TableCell>{formatDate(attachment.file.createdAt)}</TableCell>
                <TableCell className="flex space-x-3">
                  <a target="_blank" rel="noopener noreferrer" href={`/api/files?file=${encodeURIComponent(attachment.file.path)}&name=${encodeURIComponent(attachment.file.name)}`}>
                    <DownloadIcon size={20} />
                  </a>
                  <TrashIcon className="cursor-pointer" size={20} onClick={() => deleteAttachmentQ.mutate(attachment.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}