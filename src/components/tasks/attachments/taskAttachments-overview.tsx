import { TaskDetail } from "@/lib/services/tasks/task.service";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils/dates";
import { DeleteIcon, DownloadIcon, TrashIcon } from "lucide-react";
import TaskAttachmentsUpload from "./taskAttachments-upload";
import { useDeleteTaskAttachment } from "@/lib/hooks/task/task.hooks";


export default function TaskAttachmentsOverview({task}: {task: TaskDetail}) {

  const deleteAttachmentQ = useDeleteTaskAttachment(task?.id!)

  return (
    <>
      <div className="flex justify-between">
        <h3 className="text-lg">Prílohy</h3>
        <TaskAttachmentsUpload task={task}></TaskAttachmentsUpload>
      </div>
      <div className="mt-5">
        <Table>
          <TableCaption>Zoznam pripojených súborov.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Názov</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Vlastník</TableHead>
              <TableHead className="">Dátum pridania</TableHead>
              <TableHead className=""></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {task?.attachments.map((attachment) => (
              <TableRow key={attachment.id}>
                <TableCell className="font-medium">{attachment.file.name}</TableCell>
                <TableCell>{attachment.file.extension}</TableCell>
                <TableCell>{attachment.file.owner.name}</TableCell>
                <TableCell className="">{formatDate(attachment.file.createdAt)}</TableCell>
                <TableCell className="flex space-x-3">
                  <a target="_blank" href={`${process.env.NEXT_PUBLIC_URL}/api/files?file=${attachment.file.path}`}><DownloadIcon size={20} /></a>
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