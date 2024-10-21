import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import AddButton from "@/components/common/buttons/add-button";
import { Label } from "@/components/ui/label";
import { useUploadFile } from "@/lib/hooks/files.hooks";
import { TaskDetail } from "@/lib/services/tasks/task.service";
import { useQueryClient } from "@tanstack/react-query";
import { taskQueryKeys } from "@/lib/hooks/task/task.hooks";
import SubmitButton from "@/components/common/buttons/submit";


export default function TaskAttachmentsUpload({ task }: { task: TaskDetail }) {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const uploadQ = useUploadFile()
  const queryClient = useQueryClient();

  useEffect(() => {
    if(uploadQ.isSuccess) {
      queryClient.invalidateQueries({queryKey: taskQueryKeys.detail(task?.id!)})
      setOpen(false)
    }
  }, [uploadQ.isSuccess])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const sFile = e.target.files[0]
      
      if(sFile.size > 25000000) {
        alert('Súbor presahuje veľkostný limit');
        e.target.value = ''
        return
      } else {
        setFile(e.target.files[0]);
      }

    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !fileName) {
      alert('Please provide both file name and file');
      return;
    }
    uploadQ.mutate({ file, name: fileName.trim(), ref: 'task', refId: task?.id! })
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AddButton >Pridať súbor</AddButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pridať súbor</DialogTitle>
          <DialogDescription>
            Súbor, ktorý nahráte bude automaticky pripojený k úlohe. Maximálna veľkosť súboru je 25MB.
          </DialogDescription>
        </DialogHeader>
        <form id="file-upload-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fileName">Názov súboru:</Label>
            <Input id="fileName" type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fileName">Súbor:</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
        </form>
        <DialogFooter>
          <SubmitButton form="file-upload-form" type="submit" isLoading={uploadQ.isPending} >Nahrať</SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}