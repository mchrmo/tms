import { useEffect } from "react"
import { getApiClient, parseListHookParams } from "@/lib/utils/api.utils";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { TaskComment } from "@prisma/client";
// import { TaskCommentFormInputs } from "@/components/taskComments/taskComment-form";
import { useToast } from "@/components/ui/use-toast";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { z } from "zod";
import { TaskCommentDetail, TaskCommentListItem } from "../../services/tasks/taskComment.service";
import { TaskCommentCreateSchema, TaskCommentUpdateSchema } from "@/lib/models/taksComment.model";
import { PaginatedResponse, PaginatedResponseOld } from "@/lib/services/api.service";
import { taskQueryKeys } from "./task.hooks";


const taskCommentsApiClient = getApiClient('/tasks/comments')

export const taskCommentQueryKeys = {
  all: ['taskComments'],
  searched: (query: string) => [...taskCommentQueryKeys.all, query],
  details: () => [...taskCommentQueryKeys.all, 'detail'],
  detail: (id: number) => [...taskCommentQueryKeys.details(), id],
  pagination: (page: number) => [...taskCommentQueryKeys.all, 'pagination', page],
};

export const useTaskComment = (id?: number, options?: UseQueryOptions<TaskCommentDetail, Error>) => {
  const { toast } = useToast()


  const getTaskCommentFn = async () => {
    const response = await taskCommentsApiClient.get<TaskCommentDetail>(`/${id}`);
    return response.data;
  };

  const query = useQuery<TaskCommentDetail, Error>({
    queryKey: taskCommentQueryKeys.detail(Number(id)),
    queryFn: getTaskCommentFn,
    enabled: !!id,
    ...options
  });

  useEffect(() => {
    if (!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa nájsť požadované dáta`
    })
  }, [query.error])

  return query
}

export const useTaskComments = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const { urlParams, params } = parseListHookParams(pagination, filter, sort)

  const getTaskCommentsFn = async (params: { [key: string]: string }) => {
    const response = await taskCommentsApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponseOld<TaskCommentListItem>>({
    queryKey: taskCommentQueryKeys.searched(urlParams),
    queryFn: () => getTaskCommentsFn(params),
  })

  useEffect(() => {
    if (!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa načítať dáta - kód chyby: ${query.error.name}`
    })
  }, [query.error])

  return query
}

export const useUpdateTaskComment = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateTaskCommentFn = async (updateTaskCommentData: z.infer<typeof TaskCommentUpdateSchema>) => {
    const response = await taskCommentsApiClient.patch(``, updateTaskCommentData)
    return response.data
  }

  return useMutation({
    mutationFn: updateTaskCommentFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({ queryKey: taskCommentQueryKeys.detail(id) });
      const previousUser = queryClient.getQueryData(taskCommentQueryKeys.detail(id));
      // queryClient.setQueryData(taskCommentQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Komentár upravený!"
      })
    },
    onError: (err, updatedUser, context?: any) => {
      queryClient.setQueryData(
        taskCommentQueryKeys.detail(Number(id)),
        context.previousUser
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskCommentQueryKeys.all });
    },
  });


}

export const useCreateTaskComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createTaskCommentFn = async (newTaskComment: z.infer<typeof TaskCommentCreateSchema>) => {
    const response = await taskCommentsApiClient.post('', newTaskComment)
    return response.data
  }

  return useMutation({
    mutationFn: createTaskCommentFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskCommentQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Komentár vytvorený!"
      })
    },
    onError: (err: AxiosError<{ message: string }>, newTaskComment, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(taskCommentQueryKeys.all, context.previousTaskComment)
    },
    onSettled: (data) => {
      console.log(data);
      
      queryClient.invalidateQueries({ queryKey: taskCommentQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(data.task_id) });
    }
  })
}

export const useDeleteTaskComment = (id: number, task_id?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskCommentFn = async () => {
    const response = await taskCommentsApiClient.delete(`/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deleteTaskCommentFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskCommentQueryKeys.detail(id) });
      const previousUser = queryClient.getQueryData(taskCommentQueryKeys.detail(id));
      queryClient.removeQueries({ queryKey: taskCommentQueryKeys.detail(id) });
      return { previousUser };
    },
    onSuccess: () => {
      toast({
        title: 'Komentár vymazaný!',
      });
    },
    onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message;
      toast({
        title: 'Chyba',
        description: errMessage,
      });

      queryClient.setQueryData(taskCommentQueryKeys.detail(id), context.previousUser);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskCommentQueryKeys.all });
      if(task_id) queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(task_id) });

    },
  });
}