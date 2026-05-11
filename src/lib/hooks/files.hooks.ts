import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../api-client";
import { AxiosError } from "axios";

const filesApiClient = getApiClient('/files')


export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const uploadFileFn = async ({file, name, ref, refId}: {file: File, name: string, ref: string, refId: number}) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', name);
    formData.append('ref', ref);
    formData.append('refId', refId.toString());


    const response = await filesApiClient.post('', formData)
    return response.data
  }
  
  return useMutation({
    mutationFn: uploadFileFn,
    onMutate: async () => {
    },
    onSuccess: (data) => {
      toast({
        title: "Súbor nahratý!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newUser, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      toast({
        title: "Chyba",
        description: errMessage
      })
    },
    onSettled: () => {

    }
  })
}

export const useUploadFiles = () => {
  const { toast } = useToast()

  const uploadFilesFn = async ({ files, ref, refId }: { files: File[], ref: string, refId: number }) => {
    const uploads = files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('ref', ref);
      formData.append('refId', refId.toString());
      return filesApiClient.post('', formData)
    })
    const responses = await Promise.all(uploads)
    return responses.map(r => r.data)
  }

  return useMutation({
    mutationFn: uploadFilesFn,
    onSuccess: (data) => {
      toast({
        title: `${data.length} súbor${data.length === 1 ? '' : data.length < 5 ? 'y' : 'ov'} nahraté!`
      })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      toast({
        title: "Chyba pri nahrávaní",
        description: errMessage
      })
    },
  })
}