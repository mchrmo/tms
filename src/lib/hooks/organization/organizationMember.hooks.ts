import { useToast } from "@/components/ui/use-toast";
import { ZOrganizationMemberCreateForm } from "@/lib/models/organization/member.model";
import { PaginatedResponse } from "@/lib/services/api.service";
import { OrganizationMemberDetail, OrganizationMemberListItem } from "@/lib/services/organizations/organizationMembers.service";
import { getApiClient, parseListHookParamsNew } from "@/lib/utils/api.utils";
import { OrganizationMember } from "@prisma/client";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { organizationQueryKeys } from "./organization.hooks";


const organizationMembersApi = getApiClient('/organizations/members')

export const organizationMemberQueryKeys = { 
  all: ['organizationMembers'],
  searched: (query: string) => [...organizationMemberQueryKeys.all, query],
  details: () => [...organizationMemberQueryKeys.all, 'detail'],
  detail: (id: number) => [...organizationMemberQueryKeys.details(), id],
  pagination: (page: number) => [...organizationMemberQueryKeys.all, 'pagination', page],
};

export const useOrganizationMember = (id?: number, options?: UseQueryOptions<OrganizationMemberDetail, Error>) => {
  const { toast } = useToast()


  const getOrganizationMemberFn = async () => {
    const response = await organizationMembersApi.get(`/${id}`);
    return response.data;
  };

  const query = useQuery<OrganizationMemberDetail, Error>({
    queryKey: organizationMemberQueryKeys.detail(Number(id)), 
    queryFn: getOrganizationMemberFn,
    enabled: !!id,
    ...options
  });

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa nájsť organizáciu`
    })
  }, [query.error])

  return query
}

export const useOrganizationMembers = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const {params, urlParams} = parseListHookParamsNew(pagination, filter, sort)


  const getOrganizationMembersFn = async (params: {[key: string]: string}) => {
    const response = await organizationMembersApi.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<OrganizationMemberListItem>>({
    queryKey: organizationMemberQueryKeys.searched(urlParams),
    queryFn: () => getOrganizationMembersFn(params),
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

export const useUpdateOrganizationMember = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateOrganizationMemberFn = async (updateOrganizationMemberData: ZOrganizationMemberCreateForm) => {
    const response = await organizationMembersApi.patch(`/`, updateOrganizationMemberData)
    return response.data
  }

  return useMutation({
    mutationFn: updateOrganizationMemberFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({queryKey: organizationMemberQueryKeys.detail(id)});
      const previousUser = queryClient.getQueryData(organizationMemberQueryKeys.detail(id));
      // queryClient.setQueryData(organizationMemberQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Organizácia upravená!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newOrganizationMember, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      toast({
        title: "Chyba",
        description: errMessage
      })

    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: organizationMemberQueryKeys.all});
    },
  });


}

export const useCreateOrganizationMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createOrganizationMemberFn = async (newOrganizationMember: ZOrganizationMemberCreateForm) => {
    const response = await organizationMembersApi.post('', newOrganizationMember)
    return response.data
  }
  
  return useMutation({
    mutationFn: createOrganizationMemberFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: organizationMemberQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Člen pridaný do organizácie!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newOrganizationMember, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(organizationMemberQueryKeys.all, context.previousOrganizationMember)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: organizationMemberQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all })

    }
  })
}

export const useDeleteOrganizationMember = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskReminderFn = async ({new_owner}: {new_owner: number}) => {
      const response = await organizationMembersApi.delete(`/${id}?new_owner=${new_owner}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteTaskReminderFn,
      onMutate: async () => {
      if (!confirm("Určite to chcete vymazať?")) {
          throw new Error('Nič nebolo vymazané');
      }
      await queryClient.cancelQueries({ queryKey: organizationMemberQueryKeys.detail(id) });
      const previousUser = queryClient.getQueryData(organizationMemberQueryKeys.detail(id));
      queryClient.removeQueries({ queryKey: organizationMemberQueryKeys.detail(id) });
      return { previousUser };
      },
      onSuccess: () => {
      toast({
          title: 'Organizácia vymazaná z databázy!',
      });
      },
      onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
          title: 'Chyba',
          description: errMessage,
      });

      queryClient.setQueryData(organizationMemberQueryKeys.detail(id), context.previousUser);
      },
      onSettled: () => {
      queryClient.invalidateQueries({ queryKey: organizationMemberQueryKeys.all });
      },
  });
}