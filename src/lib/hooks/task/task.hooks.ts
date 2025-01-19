import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import { getApiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { Task, TaskUpdate, TaskUserRole } from "@prisma/client";
import { TaskFormInputs } from "@/components/tasks/task-form";
import { useToast } from "@/components/ui/use-toast";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { DetailResponse, PaginatedResponse } from "../../services/api.service";
import { taskUpdateQueryKeys } from "./taskUpdate.hooks";
import { parseListHookParams, parseListHookParamsNew } from "@/lib/utils/api.utils";
import { TaskDetail } from "@/lib/services/tasks/task.service";


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

export const useTask = (id?: number, options?: UseQueryOptions<DetailResponse<TaskDetail, TaskUserRole>, Error>) => {
  const { toast } = useToast()


  const getTaskFn = async () => {
    const response = await tasksApiClient.get(`/${id}`);
    return response.data;
  };

  const query = useQuery<DetailResponse<TaskDetail, TaskUserRole>, Error>({
    queryKey: taskQueryKeys.detail(Number(id)), 
    queryFn: getTaskFn,
    enabled: !!id,
    ...options,
    retry(failureCount, error) {
      if((error as AxiosError).response?.status == 403) {
        return false
      }
      if(failureCount > 2) return false
      return true
    },

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

export const useTasks = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort, queryOptions?: Partial<UseQueryOptions<PaginatedResponse<Task>>>) => {
  const { toast } = useToast()
  const { urlParams, params } = parseListHookParamsNew(pagination, filter, sort)

  const getTasksFn = async (params: {[key: string]: string}) => {
    const response = await tasksApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponse<Task>>({
    queryKey: taskQueryKeys.searched(urlParams),
    queryFn: () => getTasksFn(params),
    ...queryOptions
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
    const response = await tasksApiClient.patch(`/`, updateTaskData)
    return response.data
  }

  return useMutation({
    mutationFn: updateTaskFn,
    onMutate: async (updatedUser) => {
      // await queryClient.cancelQueries({queryKey: taskQueryKeys.detail(id)});
      // const previousUser = queryClient.getQueryData(taskQueryKeys.detail(id));
      // queryClient.setQueryData(taskQueryKeys.detail(Number(id)), updatedUser);
      // return { previousUser: previousUser, updatedUser: updatedUser };
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
      queryClient.invalidateQueries({queryKey: taskUpdateQueryKeys.all});

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
    onError: (err: AxiosError<{message: string}>, newTask, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

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

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const deleteTask = async ({taskId}: {taskId: number}) => {
    const response = await tasksApiClient.delete(`/${taskId}`,)
    return response.data
  }
  
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async () => {
      if (!confirm("Určite chcete úlohu vymazať?")) {
        throw new Error('Úloha nebola vymazaná');
      }

      await queryClient.cancelQueries({ queryKey: taskQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Úloha vymazaná!"
      })
    },
    onError: (err: AxiosError<{message: string}>) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

    },
    onSettled: (task) => {  
      // queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(task.id) })
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


export const useDeleteTaskAttachment = (taskId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskAttachmerFn = async (id: number) => {
      const response = await tasksApiClient.delete(`/attachments/${id}`);
      return response.data;
  };

  return useMutation({
      mutationFn: deleteTaskAttachmerFn,
      onMutate: async () => {
      if (!confirm("Určite to chcete vymazať?")) {
          throw new Error('Nič nebolo vymazané');
      }
      },
      onSuccess: () => {
      toast({
          title: 'Príloha odstránená!',
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
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(taskId) });
      },
  });
}


export const useUpdateTaskMeta = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const updateTaskMetaFn = async (metaData: {taskId: number, key: string, value: string}) => {
    const response = await tasksApiClient.post('/meta', metaData)
    return response.data
  }
  
  return useMutation({
    mutationFn: updateTaskMetaFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Zmeny uložené!"
      })
    },
    onError: (err: AxiosError<{message: string}>) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

    },
    onSettled: (metaData) => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(metaData.taskId) })
    }
  })
}

export const useDeleteTaskMeta = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const deleteTaskMeta = async ({taskId, key}: {taskId: number, key: string}) => {
    const response = await tasksApiClient.delete(`/meta?taskId=${taskId}&key=${key}`,)
    return response.data
  }
  
  return useMutation({
    mutationFn: deleteTaskMeta,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Zmeny uložené!"
      })
    },
    onError: (err: AxiosError<{message: string}>) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

    },
    onSettled: (metaData) => {  
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(metaData.taskId) })
    }
  })
}