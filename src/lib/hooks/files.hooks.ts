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