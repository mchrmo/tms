import { useToast } from "@/components/ui/use-toast"
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table"
import { getApiClient } from "../api-client"
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { PaginatedResponse } from "../services/api.service";
import { UserRegistrationFormInputs, ZUserUpdateForm } from "../models/user.model";
import { UserDetail, UserListItem } from "../services/user.service";
import { parseListHookParamsNew } from "../utils/api.utils";

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


  const {params, urlParams} = parseListHookParamsNew(pagination, filter, sort)


  const getUsersFn = async (params: {[key: string]: string}) => {
    const response = await userApiClient.get<PaginatedResponse<UserListItem>>('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<UserListItem>>({
    queryKey: userQueryKeys.searched(urlParams),
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

export const useUpdateUser = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateUserFn = async (updateUserData: ZUserUpdateForm) => {
    const response = await userApiClient.patch(`/`, updateUserData)
    return response.data
  }

  return useMutation({
    mutationFn: updateUserFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({queryKey: userQueryKeys.detail(id)});
      const previousUser = queryClient.getQueryData(userQueryKeys.detail(id));
      queryClient.setQueryData(userQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Údaje užívateľa aktualizované!"
      })
    },
    onError: (err, updatedUser, context?: any) => {
      queryClient.setQueryData(
        userQueryKeys.detail(Number(id)),
        context.previousUser
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: userQueryKeys.all});
    },
  });
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