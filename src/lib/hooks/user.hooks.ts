import { useToast } from "@/components/ui/use-toast"
import { ColumnFiltersState, ColumnSort } from "@tanstack/react-table"
import { getApiClient } from "../api-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/db/user.repository";
import { useEffect } from "react";
import { AxiosError } from "axios";

const userApiClient = getApiClient('/users')

export const userQueryKeys = {
  all: ['users'],
  searched: (query: string) => [...userQueryKeys.all, query],
  details: () => [...userQueryKeys.all, 'detail'],
  detail: (id: number) => [...userQueryKeys.details(), id],
  pagination: (page: number) => [...userQueryKeys.all, 'pagination', page],
  infinite: () => [...userQueryKeys.all, 'infinite'],
  assigned: () => [...userQueryKeys.all, 'assigned']
};


export const useUsers = (filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const params: {[key: string]: any} = {}
  let urlQuery = ''

  if(filter) {

    filter.forEach((f, i) => {
      params["filter_" + f.id] = f.value
      urlQuery += `${f.id}=${f.value}`
      if(i < filter.length-1) urlQuery += '&' 
    })
  }

  if(sort) {
    params['orderBy'] = sort.id
    params['order'] = sort.desc ? 'desc' : 'asc'
  }


  const getUsersFn = async (params: {[key: string]: string}) => {
    const response = await userApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<User[]>({
    queryKey: userQueryKeys.searched(urlQuery),
    queryFn: () => getUsersFn(params),
  })

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa načítať užívateľov - kód chyby: ${query.error.name}`
    })
  }, [query.error])

  return query 
}

export const useResetRegistration = () => {
  const { toast } = useToast();

  const resetRegistrationFn = async (clerk_id: string) => {
    const response = await userApiClient.post(`/reset?id=${clerk_id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: resetRegistrationFn,
    onMutate: async () => {
    },
    onSuccess: () => {
      toast({
        title: 'Registrácia bola resetovaná!',
      });
    },
    onError: (err: AxiosError<{ error: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.error : err.message;
      toast({
        title: 'Chyba',
        description: errMessage,
      });
    },
  });
}