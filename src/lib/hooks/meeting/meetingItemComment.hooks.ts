import { useToast } from "@/components/ui/use-toast";
import { ZMeetingItemCommentCreateForm } from "@/lib/models/meeting/meetingItemComment.model";
import { MeetingItemCommentDetail } from "@/lib/services/meetings/meetingItemComment.service";
import { getApiClient } from "@/lib/utils/api.utils";
import { MeetingItemComment } from "@prisma/client";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { meetingQueryKeys } from "./meeting.hooks";
import { meetingItemQueryKeys } from "./meetingItem.hooks";


const meetingItemCommentsApi = getApiClient('/meetings/items/comments')

export const meetingItemCommentQueryKeys = {
  all: ['meetingItemComments'],
  searched: (query: string) => [...meetingItemCommentQueryKeys.all, query],
  details: () => [...meetingItemCommentQueryKeys.all, 'detail'],
  detail: (id: number) => [...meetingItemCommentQueryKeys.details(), id],
  pagination: (page: number) => [...meetingItemCommentQueryKeys.all, 'pagination', page],
};

export const useCreateMeetingItemComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createMeetingItemCommentFn = async (newMeetingItemComment: ZMeetingItemCommentCreateForm) => {
    const response = await meetingItemCommentsApi.post('', newMeetingItemComment)
    return response.data
  }
  
  return useMutation({
    mutationFn: createMeetingItemCommentFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: meetingItemCommentQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Návrh pridaný!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newMeetingItemComment, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(meetingItemCommentQueryKeys.all, context.previousMeetingItemComment)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetingItemQueryKeys.all })

    }
  })
}

export const useDeleteMeetingItemComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskReminderFn = async (id: number) => {
      const response = await meetingItemCommentsApi.delete<MeetingItemCommentDetail>(`/${id}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteTaskReminderFn,
      onMutate: async () => {
        if (!confirm("Určite to chcete vymazať?")) {
            throw new Error('Nič nebolo vymazané');
        }
      },
      onSuccess: () => {
        toast({
            title: 'Komentár vymazaný!',
        });
        },
      onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
        const errMessage = err.response?.data ? err.response.data.message : err.message;
        toast({
            title: 'Chyba',
            description: errMessage,
        });
      },
      onSettled: () => {
              queryClient.invalidateQueries({ queryKey: meetingItemQueryKeys.all })
      },
  });
}
