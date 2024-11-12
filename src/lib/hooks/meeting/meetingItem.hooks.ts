import { useToast } from "@/components/ui/use-toast";
import { ZMeetingItemCreateForm } from "@/lib/models/meeting/meetingItem.model";
import { MeetingItemDetail, MeetingItemListItem } from "@/lib/services/meetings/meetingItem.service";
import { getApiClient, parseListHookParamsNew } from "@/lib/utils/api.utils";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { meetingQueryKeys } from "./meeting.hooks";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { PaginatedResponse } from "@/lib/services/api.service";


const meetingItemsApi = getApiClient('/meetings/items')

export const meetingItemQueryKeys = {
  all: ['meetingItems'],
  searched: (query: string) => [...meetingItemQueryKeys.all, query],
  details: () => [...meetingItemQueryKeys.all, 'detail'],
  detail: (id: number) => [...meetingItemQueryKeys.details(), id],
  pagination: (page: number) => [...meetingItemQueryKeys.all, 'pagination', page],
};

export const useMeetingItem = (id?: number, options?: UseQueryOptions<MeetingItemDetail, Error>) => {
  const { toast } = useToast()


  const getMeetingItemFn = async () => {
    const response = await meetingItemsApi.get<MeetingItemDetail>(`/${id}`);
    return response.data;
  };

  const query = useQuery<MeetingItemDetail, Error>({
    queryKey: meetingItemQueryKeys.detail(Number(id)), 
    queryFn: getMeetingItemFn,
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

export const useMeetingItems = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const {params, urlParams} = parseListHookParamsNew(pagination, filter, sort)


  const getOrganizationsFn = async (params: {[key: string]: string}) => {
    const response = await meetingItemsApi.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<MeetingItemListItem>>({
    queryKey: meetingItemQueryKeys.searched(urlParams),
    queryFn: () => getOrganizationsFn(params),
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

export const useUpdateMeetingItem = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateMeetingItemFn = async (updateMeetingItemData: ZMeetingItemCreateForm) => {
    const response = await meetingItemsApi.patch(`/`, updateMeetingItemData)
    return response.data
  }

  return useMutation({
    mutationFn: updateMeetingItemFn,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({queryKey: meetingItemQueryKeys.detail(id)});
      const previousItem = queryClient.getQueryData(meetingItemQueryKeys.detail(id));
      // queryClient.setQueryData(meetingItemQueryKeys.detail(Number(id)), updatedItem);
      return { previousItem: previousItem, updatedItem: updatedItem };
    },
    onSuccess: (data) => {
      toast({
        title: "Návrh upravený!"
      })
    },
    onError: (err, updatedItem, context?: any) => {
      queryClient.setQueryData(
        meetingItemQueryKeys.detail(Number(id)),
        context.previousItem
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: meetingItemQueryKeys.all});
    },
  });
}

export const useCreateMeetingItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createMeetingItemFn = async (newMeetingItem: ZMeetingItemCreateForm) => {
    const response = await meetingItemsApi.post('', newMeetingItem)
    return response.data
  }
  
  return useMutation({
    mutationFn: createMeetingItemFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: meetingItemQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Návrh pridaný!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newMeetingItem, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(meetingItemQueryKeys.all, context.previousMeetingItem)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetingItemQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all })

    }
  })
}

export const useDeleteMeetingItem = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskReminderFn = async () => {
      const response = await meetingItemsApi.delete(`/${id}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteTaskReminderFn,
      onMutate: async () => {
      if (!confirm("Určite to chcete vymazať?")) {
          throw new Error('Nič nebolo vymazané');
      }
      await queryClient.cancelQueries({ queryKey: meetingItemQueryKeys.detail(id) });
      const previousItem = queryClient.getQueryData(meetingItemQueryKeys.detail(id));
      queryClient.removeQueries({ queryKey: meetingItemQueryKeys.detail(id) });
      return { previousItem };
      },
      onSuccess: () => {
      toast({
          title: 'Návrh vymazaný z databázy!',
      });
      },
      onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
          title: 'Chyba',
          description: errMessage,
      });

      queryClient.setQueryData(meetingItemQueryKeys.detail(id), context.previousItem);
      },
      onSettled: () => {
        
      },
  });
}

export const usePublishMeetingItem = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const publishMeetingItemFn = async () => {
    const response = await meetingItemsApi.post(`/publish`, {id})
    return response.data
  }

  return useMutation({
    mutationFn: publishMeetingItemFn,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({queryKey: meetingItemQueryKeys.detail(id)});
      const previousItem = queryClient.getQueryData(meetingItemQueryKeys.detail(id));
      // queryClient.setQueryData(meetingItemQueryKeys.detail(Number(id)), updatedItem);
      return { previousItem: previousItem, updatedItem: updatedItem };
    },
    onSuccess: (data) => {
      toast({
        title: "Bod porady publikovaný!"
      })
    },
    onError: (err, updatedItem, context?: any) => {
      queryClient.setQueryData(
        meetingItemQueryKeys.detail(Number(id)),
        context.previousItem
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: meetingQueryKeys.all});
    },
  });
}

export const useResolveMeetingItem = () => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const resolveMeetingItemFn = async ({id, status}: {id: number, status: 'ACCEPTED' | 'DENIED'}) => {
    const response = await meetingItemsApi.post(`/resolve`, {id, status})
    return response.data
  }

  return useMutation({
    mutationFn: resolveMeetingItemFn,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({queryKey: meetingItemQueryKeys.detail(updatedItem.id)});
      const previousItem = queryClient.getQueryData(meetingItemQueryKeys.detail(updatedItem.id));
      // queryClient.setQueryData(meetingItemQueryKeys.detail(Number(id)), updatedItem);
      return { previousItem: previousItem, updatedItem: updatedItem };
    },
    onSuccess: (data) => {

      let status = data.status && data.status === "ACCEPTED" ? 'schválený' : 'odmietnutý'
      toast({
        title: `Bod porady bol ${status}!`
      })
    },
    onError: (err, updatedItem, context?: any) => {
      queryClient.setQueryData(
        meetingItemQueryKeys.detail(Number(updatedItem.id)),
        context.previousItem
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: meetingQueryKeys.all});
    },
  });
}