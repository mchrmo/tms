import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import { getApiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { Task, TaskUpdate } from "@prisma/client";
import { TaskFormInputs } from "@/components/tasks/task-form";
import { useToast } from "@/components/ui/use-toast";
import { ColumnFiltersState, ColumnSort } from "@tanstack/react-table";
import { AxiosError } from "axios";

interface MyInt {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  // Add other fields as necessary
}


const tasksApiClient = getApiClient('/tasks')

export const taskQueryKeys = {
  all: ['tasks'],
  searched: (query: string) => [...taskQueryKeys.all, query],
  details: () => [...taskQueryKeys.all, 'detail'],
  detail: (id: number) => [...taskQueryKeys.details(), id],
  pagination: (page: number) => [...taskQueryKeys.all, 'pagination', page],
  infinite: () => [...taskQueryKeys.all, 'infinite'],
  assigned: () => [...taskQueryKeys.all, 'assigned']
};

export const useTask = (id?: number, options?: UseQueryOptions<Task, Error>) => {
  const { toast } = useToast()


  const getTaskFn = async () => {
    const response = await tasksApiClient.get<Task>(`/${id}`);
    return response.data;
  };

  const query = useQuery<Task, Error>({
    queryKey: taskQueryKeys.detail(Number(id)), 
    queryFn: getTaskFn,
    enabled: !!id,
    ...options
  });

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa nájsť úlohu`
    })
  }, [query.error])


  

  return query
}

export const useTasks = (filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const params: {[key: string]: any} = {}
  let urlQuery = ''

  if(filter) {

    filter.forEach((f, i) => {
      params[f.id] = f.value
      urlQuery += `${f.id}=${f.value}`
      if(i < filter.length-1) urlQuery += '&' 
    })
  }

  if(sort) {
    params['sortBy'] = sort.id
    params['sortDirection'] = sort.desc ? 'desc' : 'asc'
  }

  const getTasksFn = async (params: {[key: string]: string}) => {
    const response = await tasksApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<Task[]>({
    queryKey: taskQueryKeys.searched(urlQuery),
    queryFn: () => getTasksFn(params),
  })

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa načítať úlohy - kód chyby: ${query.error.name}`
    })
  }, [query.error])

  return query 
}

export const useSubTasks = (parentId: number, sort?: ColumnSort) => {
  const { toast } = useToast()

  const params: {[key: string]: any} = {}
  let urlQuery = ''


  if(sort) {
    params['sortBy'] = sort.id
    params['sortDirection'] = sort.desc ? 'desc' : 'asc'
  }
  params['parent_id'] = parentId
  
  const getSubTasksFn = async (params: {[key: string]: string}) => {
    const response = await tasksApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<Task[]>({
    queryKey: taskQueryKeys.searched(urlQuery),
    queryFn: () => getSubTasksFn(params),
  })

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa načítať úlohy - kód chyby: ${query.error.name}`
    })
  }, [query.error])

  return query 
}

export const useUpdateTask = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateTaskFn = async (updateTaskData: TaskFormInputs) => {
    const response = await tasksApiClient.patch(`/${id}`, updateTaskData)
    return response.data
  }

  return useMutation({
    mutationFn: updateTaskFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({queryKey: taskQueryKeys.detail(id)});
      const previousUser = queryClient.getQueryData(taskQueryKeys.detail(id));
      queryClient.setQueryData(taskQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Úloha upravená!"
      })
    },
    onError: (err, updatedUser, context?: any) => {
      queryClient.setQueryData(
        taskQueryKeys.detail(Number(id)),
        context.previousUser
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: taskQueryKeys.all});
    },
  });


}

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createTaskFn = async (newTask: TaskFormInputs) => {
    const response = await tasksApiClient.post('', newTask)
    return response.data
  }
  
  return useMutation({
    mutationFn: createTaskFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Úloha vytvorená!"
      })
    },
    onError: (err: AxiosError<{error: string}>, newTask, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.error : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(taskQueryKeys.all, context.previousTask)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all })
    }
  })
}

// addds

export const useMyTasks = () => {

  const getTasksFn = async () => {
    const response = await tasksApiClient.get('/my')
    return response.data
  }

  return useQuery<Task[]>({
    queryKey: taskQueryKeys.assigned(),
    queryFn: () => getTasksFn(),
  })

}