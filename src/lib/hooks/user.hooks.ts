import { useToast } from "@/components/ui/use-toast"
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table"
import { getApiClient } from "../api-client"
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { User } from "@/lib/db/user.repository";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { PaginatedResponse } from "../services/api.service";
import { UserRegistrationFormInputs } from "../models/user.model";
import { UserDetail } from "../services/user.service";

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


export const useUsers = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const params: {[key: string]: any} = {
    page: pagination.pageIndex+1,
    pageSize: pagination.pageSize
  }
  let urlQuery = ''

  if(filter) {
    filter.forEach((f, i) => {
      params["filter_" + f.id] = f.value
      urlQuery += `${f.id}=${f.value}`
      if(i < filter.length-1) urlQuery += '&' 
    })
  }

  if(sort) {
    params['order_' + sort.id] = sort.desc ? 'desc' : 'asc'
  }


  const getUsersFn = async (params: {[key: string]: string}) => {
    const response = await userApiClient.get<PaginatedResponse<User>>('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<User>>({
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

export const useUser = (id?: number, options?: UseQueryOptions<UserDetail, Error>) => {
  const { toast } = useToast()


  const getUserFn = async () => {
    const response = await userApiClient.get<UserDetail>(`/${id}`);
    return response.data;
  };

  const query = useQuery<UserDetail, Error>({
    queryKey: userQueryKeys.detail(Number(id)), 
    queryFn: getUserFn,
    enabled: !!id || id == 0,
    ...options
  });

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa nájsť užívateľa`
    })
  }, [query.error])

  return query
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createUserFn = async (newUser: UserRegistrationFormInputs) => {
    const response = await userApiClient.post('', newUser)
    return response.data
  }
  
  return useMutation({
    mutationFn: createUserFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Užívateľ vytvorený!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newUser, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(userQueryKeys.all, context.previousUser)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    }
  })
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
    onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
        title: 'Chyba',
        description: errMessage,
      });
    },
  });
}

export const useChangeUserPassword = () => {
  const { toast } = useToast();

  const changePasswordFn = async ({user_id, password}: {user_id: number, password: string}) => {
    const response = await userApiClient.post(`/change-password`, {user_id, password});
    return response.data;
  };

  return useMutation({
    mutationFn: changePasswordFn,
    onMutate: async () => {
    },
    onSuccess: () => {
      toast({
        title: 'Heslo bolo zmenené!',
      });
    },
    onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
        title: 'Chyba',
        description: errMessage,
      });
    },
  });
}