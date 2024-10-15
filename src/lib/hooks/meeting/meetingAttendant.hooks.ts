import { useToast } from "@/components/ui/use-toast";
import { ZMeetingAttendantCreateForm } from "@/lib/models/meeting/meetingAttendant.model";
import { getApiClient } from "@/lib/utils/api.utils";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { meetingQueryKeys } from "./meeting.hooks";


const meetingAttendantsApi = getApiClient('/meetings/attendants')

export const meetingAttendantQueryKeys = {
  all: ['meetingAttendants'],
  searched: (query: string) => [...meetingAttendantQueryKeys.all, query],
  details: () => [...meetingAttendantQueryKeys.all, 'detail'],
  detail: (id: number) => [...meetingAttendantQueryKeys.details(), id],
  pagination: (page: number) => [...meetingAttendantQueryKeys.all, 'pagination', page],
};


export const useCreateMeetingAttendant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createMeetingAttendantFn = async (newMeetingAttendant: ZMeetingAttendantCreateForm) => {
    const response = await meetingAttendantsApi.post('', newMeetingAttendant)
    return response.data
  }
  
  return useMutation({
    mutationFn: createMeetingAttendantFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: meetingAttendantQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Účastník pridaný!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newMeetingAttendant, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      
      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(meetingAttendantQueryKeys.all, context.previousMeetingAttendant)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetingAttendantQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all })
    }
  })
}

export const useDeleteMeetingAttendant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteAttendantFn = async (id: number) => {
      const response = await meetingAttendantsApi.delete(`/${id}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteAttendantFn,
      onMutate: async () => {
      if (!confirm("Určite chcete odobrať účastníka z porady?")) {
          throw new Error('Účastník nebol vymazaný');
      }

    },
      onSuccess: () => {
      toast({
          title: 'Účastník bol odstránený z porady!',
      });
      },
      onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
          title: 'Chyba',
          description: errMessage,
      });

      // queryClient.setQueryData(meetingAttendantQueryKeys.detail(id), context.previousUser);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all });
      },
  });
}