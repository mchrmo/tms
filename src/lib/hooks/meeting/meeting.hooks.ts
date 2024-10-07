import { useToast } from "@/components/ui/use-toast";
import { ZMeetingCreateForm } from "@/lib/models/meeting/meeting.model";
import { PaginatedResponse } from "@/lib/services/api.service";
import { MeetingDetail } from "@/lib/services/meetings/meeting.service";
import { getApiClient, parseListHookParams } from "@/lib/utils/api.utils";
import { Meeting } from "@prisma/client";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { useEffect } from "react";


const meetingsApi = getApiClient('/meetings')

export const meetingQueryKeys = {
  all: ['meetings'],
  searched: (query: string) => [...meetingQueryKeys.all, query],
  details: () => [...meetingQueryKeys.all, 'detail'],
  detail: (id: number) => [...meetingQueryKeys.details(), id],
  pagination: (page: number) => [...meetingQueryKeys.all, 'pagination', page],
};

export const useMeeting = (id?: number, options?: UseQueryOptions<MeetingDetail, Error>) => {
  const { toast } = useToast()


  const getMeetingFn = async () => {
    const response = await meetingsApi.get(`/${id}`);
    return response.data;
  };

  const query = useQuery<MeetingDetail, Error>({
    queryKey: meetingQueryKeys.detail(Number(id)), 
    queryFn: getMeetingFn,
    enabled: !!id,
    ...options
  });

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa nájsť poradu`
    })
  }, [query.error])

  return query
}

export const useMeetings = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const { urlParams, params } = parseListHookParams(pagination, filter, sort)


  const getMeetingsFn = async (params: {[key: string]: string}) => {
    const response = await meetingsApi.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<Meeting>>({
    queryKey: meetingQueryKeys.searched(urlParams),
    queryFn: () => getMeetingsFn(params),
  })

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa načítať - kód chyby: ${query.error.message}`
    })
  }, [query.error])

  return query 
}

export const useUpdateMeeting = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateMeetingFn = async (updateMeetingData: ZMeetingCreateForm) => {
    const response = await meetingsApi.patch(`/`, updateMeetingData)
    return response.data
  }

  return useMutation({
    mutationFn: updateMeetingFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({queryKey: meetingQueryKeys.detail(id)});
      const previousUser = queryClient.getQueryData(meetingQueryKeys.detail(id));
      queryClient.setQueryData(meetingQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Porada upravená!"
      })
    },
    onError: (err, updatedUser, context?: any) => {
      queryClient.setQueryData(
        meetingQueryKeys.detail(Number(id)),
        context.previousUser
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: meetingQueryKeys.all});
    },
  });


}

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createMeetingFn = async (newMeeting: ZMeetingCreateForm) => {
    const response = await meetingsApi.post('', newMeeting)
    return response.data
  }
  
  return useMutation({
    mutationFn: createMeetingFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: meetingQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Porada vytvorená!"
      })
    },
    onError: (err: AxiosError<{error: string}>, newMeeting, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(meetingQueryKeys.all, context.previousMeeting)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all })
    }
  })
}

export const useDeleteMeeting = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskReminderFn = async () => {
      const response = await meetingsApi.delete(`/${id}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteTaskReminderFn,
      onMutate: async () => {
      if (!confirm("Určite to chcete vymazať?")) {
          throw new Error('Nič nebolo vymazané');
      }
      await queryClient.cancelQueries({ queryKey: meetingQueryKeys.detail(id) });
      const previousUser = queryClient.getQueryData(meetingQueryKeys.detail(id));
      queryClient.removeQueries({ queryKey: meetingQueryKeys.detail(id) });
      return { previousUser };
      },
      onSuccess: () => {
      toast({
          title: 'Porada vymazaná z databázy!',
      });
      },
      onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
          title: 'Chyba',
          description: errMessage,
      });

      queryClient.setQueryData(meetingQueryKeys.detail(id), context.previousUser);
      },
      onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all });
      },
  });
}