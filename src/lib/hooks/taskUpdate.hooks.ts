import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { getApiClient } from "../api-client";
import { useToast } from "@/components/ui/use-toast";
import { parseListHookParams } from "../utils/api.utils";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "../services/api.service";
import { TaskUpdateListItem } from "../services/taskUpdate.service";
import { useEffect } from "react";


const taskUpdatesApiClient = getApiClient('/tasks/updates')

export const taskUpdateQueryKeys = {
  all: ['taskUpdates'],
  searched: (query: string) => [...taskUpdateQueryKeys.all, query],
  details: () => [...taskUpdateQueryKeys.all, 'detail'],
  detail: (id: number) => [...taskUpdateQueryKeys.details(), id],
  pagination: (page: number) => [...taskUpdateQueryKeys.all, 'pagination', page],
};
export const useTaskUpdates = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const { urlParams, params } = parseListHookParams(pagination, filter, sort)

  const getTaskUpdatesFn = async (params: {[key: string]: string}) => {
    const response = await taskUpdatesApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<TaskUpdateListItem>>({
    queryKey: taskUpdateQueryKeys.searched(urlParams),
    queryFn: () => getTaskUpdatesFn(params),
  })

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa načítať dáta - kód chyby: ${query.error.name}`
    })
  }, [query.error])

  return query 
}