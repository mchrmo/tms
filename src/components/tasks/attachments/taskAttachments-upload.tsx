import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AddButton from "@/components/common/buttons/add-button";
import { Label } from "@/components/ui/label";
import { useUploadFiles } from "@/lib/hooks/files.hooks";
import { TaskDetail } from "@/lib/services/tasks/task.service";
import { useQueryClient } from "@tanstack/react-query";
import { taskQueryKeys } from "@/lib/hooks/task/task.hooks";
import SubmitButton from "@/components/common/buttons/submit";
import { XIcon } from "lucide-react";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export default function TaskAttachmentsUpload({ task }: { task: TaskDetail }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadQ = useUploadFiles();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (uploadQ.isSuccess) {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(task?.id!) });
      setOpen(false);
    }
  }, [uploadQ.isSuccess]);

  const handleOpenChange = (value: boolean) => {
    if (!value) setFiles([]);
    setOpen(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const oversized = selected.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      alert(`Nasledujúce súbory presahujú limit 25 MB:\n${oversized.map(f => f.name).join('\n')}`);
    }
    const valid = selected.filter(f => f.size <= MAX_FILE_SIZE);
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !existingNames.has(f.name))];
    });
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;
    uploadQ.mutate({ files, ref: 'task', refId: task?.id! });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <AddButton variant={'outline'}>Pridať súbor</AddButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Pridať súbory</DialogTitle>
          <DialogDescription>
            Môžete naraz nahrať viacero súborov. Každý súbor môže mať maximálne 25 MB.
          </DialogDescription>
        </DialogHeader>
        <form id="file-upload-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="files">Vybrať súbory:</Label>
            <Input
              id="files"
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <Label>Vybrané súbory ({files.length}):</Label>
              <ul className="mt-1 divide-y rounded border text-sm">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-1.5">
                    <span className="truncate max-w-[360px]" title={file.name}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <XIcon size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
        <DialogFooter>
          <SubmitButton
            form="file-upload-form"
            type="submit"
            isLoading={uploadQ.isPending}
            disabled={files.length === 0}
          >
            Nahrať{files.length > 1 ? ` (${files.length})` : ''}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}