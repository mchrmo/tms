import { useToast } from "@/components/ui/use-toast";
import { ZOrganizationCreateForm } from "@/lib/models/organization/organization.model";
import { PaginatedResponse } from "@/lib/services/api.service";
import { OrganizationDetail, OrganizationListItem } from "@/lib/services/organizations/organizations.service";
import { getApiClient, parseListHookParamsNew } from "@/lib/utils/api.utils";
import { Organization } from "@prisma/client";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { useEffect } from "react";


const organizationsApi = getApiClient('/organizations')

export const organizationQueryKeys = { 
  all: ['organizations'],
  searched: (query: string) => [...organizationQueryKeys.all, query],
  details: () => [...organizationQueryKeys.all, 'detail'],
  detail: (id: number) => [...organizationQueryKeys.details(), id],
  pagination: (page: number) => [...organizationQueryKeys.all, 'pagination', page],
};

export const useOrganization = (id?: number, options?: UseQueryOptions<OrganizationDetail, Error>) => {
  const { toast } = useToast()


  const getOrganizationFn = async () => {
    const response = await organizationsApi.get(`/${id}`);
    return response.data;
  };

  const query = useQuery<OrganizationDetail, Error>({
    queryKey: organizationQueryKeys.detail(Number(id)), 
    queryFn: getOrganizationFn,
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

export const useOrganizations = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const {params, urlParams} = parseListHookParamsNew(pagination, filter, sort)


  const getOrganizationsFn = async (params: {[key: string]: string}) => {
    const response = await organizationsApi.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<OrganizationListItem>>({
    queryKey: organizationQueryKeys.searched(urlParams),
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

export const useUpdateOrganization = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateOrganizationFn = async (updateOrganizationData: ZOrganizationCreateForm) => {
    const response = await organizationsApi.patch(`/`, updateOrganizationData)
    return response.data
  }

  return useMutation({
    mutationFn: updateOrganizationFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({queryKey: organizationQueryKeys.detail(id)});
      const previousUser = queryClient.getQueryData(organizationQueryKeys.detail(id));
      // queryClient.setQueryData(organizationQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Organizácia upravená!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newOrganization, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      toast({
        title: "Chyba",
        description: errMessage
      })

    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: organizationQueryKeys.all});
    },
  });


}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createOrganizationFn = async (newOrganization: ZOrganizationCreateForm) => {
    const response = await organizationsApi.post('', newOrganization)
    return response.data
  }
  
  return useMutation({
    mutationFn: createOrganizationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: organizationQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Organizácia vytvorená!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newOrganization, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message
      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(organizationQueryKeys.all, context.previousOrganization)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all })
    }
  })
}

export const useDeleteOrganization = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskReminderFn = async () => {
      const response = await organizationsApi.delete(`/${id}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteTaskReminderFn,
      onMutate: async () => {
      if (!confirm("Určite to chcete vymazať?")) {
          throw new Error('Nič nebolo vymazané');
      }
      await queryClient.cancelQueries({ queryKey: organizationQueryKeys.detail(id) });
      const previousUser = queryClient.getQueryData(organizationQueryKeys.detail(id));
      queryClient.removeQueries({ queryKey: organizationQueryKeys.detail(id) });
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

      queryClient.setQueryData(organizationQueryKeys.detail(id), context.previousUser);
      },
      onSettled: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      },
  });
}