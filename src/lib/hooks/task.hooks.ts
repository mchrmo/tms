import { useParams } from "next/navigation";
import { useState } from "react"
import { getApiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Task, TaskUpdate } from "@prisma/client";
import { TaskFormInputs } from "@/components/tasks/task-form";
import { useToast } from "@/components/ui/use-toast";


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

export const useTask = () => {

  const { id } = useParams();

  const getTaskFn = async () => {
    const response = await tasksApiClient.get<Task>(`/${id}`);
    return response.data;
  };


  return useQuery({
    queryKey: taskQueryKeys.detail(Number(id)),
    queryFn: getTaskFn,
    retry: 1,
  });

}

export const useTasks = (query?: string) => {

  const getTasksFn = async (query?: string) => {
    const response = await tasksApiClient.get('', {
      params: {
        search: query ? query : ''
      }
    })
    return response.data
  }

  return useQuery<Task[]>({
    queryKey: taskQueryKeys.searched(query ? query : ''),
    queryFn: () => getTasksFn(query),
  })

}

export const useUpdateTask = (id: number) => {

  const queryClient = useQueryClient()

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
    onError: (err, newTask, context?: any) => {
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