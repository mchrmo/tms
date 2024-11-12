import { useEffect } from "react"
import { getApiClient, parseListHookParams } from "@/lib/utils/api.utils";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { TaskReminder } from "@prisma/client";
// import { TaskReminderFormInputs } from "@/components/taskReminders/taskReminder-form";
import { useToast } from "@/components/ui/use-toast";
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { z } from "zod";
import { TaskReminderDetail, TaskReminderListItem } from "../../services/tasks/taskReminder.service";
import { TaskReminderUpdateSchema } from "../../models/taskReminder.model";
import { PaginatedResponse, PaginatedResponseOld } from "@/lib/services/api.service";


const taskRemindersApiClient = getApiClient('/tasks/reminders')

export const taskReminderQueryKeys = {
  all: ['taskReminders'],
  searched: (query: string) => [...taskReminderQueryKeys.all, query],
  details: () => [...taskReminderQueryKeys.all, 'detail'],
  detail: (id: number) => [...taskReminderQueryKeys.details(), id],
  pagination: (page: number) => [...taskReminderQueryKeys.all, 'pagination', page],
};

export const useTaskReminder = (id?: number, options?: UseQueryOptions<TaskReminderDetail, Error>) => {
  const { toast } = useToast()


  const getTaskReminderFn = async () => {
    const response = await taskRemindersApiClient.get<TaskReminderDetail>(`/${id}`);
    return response.data;
  };

  const query = useQuery<TaskReminderDetail, Error>({
    queryKey: taskReminderQueryKeys.detail(Number(id)), 
    queryFn: getTaskReminderFn,
    enabled: !!id,
    ...options
  });

  useEffect(() => {
    if(!query.error) return
    toast({
      title: "Chyba",
      description: `Nepodarilo sa nájsť požadované dáta`
    })
  }, [query.error])

  return query
}

export const useTaskReminders = (pagination: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) => {
  const { toast } = useToast()

  const { urlParams, params } = parseListHookParams(pagination, filter, sort)

  const getTaskRemindersFn = async (params: {[key: string]: string}) => {
    const response = await taskRemindersApiClient.get('', {
      params
    })
    return response.data
  }

  const query = useQuery<PaginatedResponseOld<TaskReminderListItem>>({
    queryKey: taskReminderQueryKeys.searched(urlParams),
    queryFn: () => getTaskRemindersFn(params),
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

export const useUpdateTaskReminder = (id: number) => {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateTaskReminderFn = async (updateTaskReminderData: z.infer<typeof TaskReminderUpdateSchema>) => {
    const response = await taskRemindersApiClient.patch(``, updateTaskReminderData)
    return response.data
  }

  return useMutation({
    mutationFn: updateTaskReminderFn,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({queryKey: taskReminderQueryKeys.detail(id)});
      const previousUser = queryClient.getQueryData(taskReminderQueryKeys.detail(id));
      // queryClient.setQueryData(taskReminderQueryKeys.detail(Number(id)), updatedUser);
      return { previousUser: previousUser, updatedUser: updatedUser };
    },
    onSuccess: (data) => {
      toast({
        title: "Pripomienka upravená!"
      })
    },
    onError: (err, updatedUser, context?: any) => {
      queryClient.setQueryData(
        taskReminderQueryKeys.detail(Number(id)),
        context.previousUser
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: taskReminderQueryKeys.all});
    },
  });


}

export const useCreateTaskReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  const createTaskReminderFn = async (newTaskReminder: z.infer<typeof TaskReminderUpdateSchema>) => {
    const response = await taskRemindersApiClient.post('', newTaskReminder)
    return response.data
  }
  
  return useMutation({
    mutationFn: createTaskReminderFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskReminderQueryKeys.all })
    },
    onSuccess: (data) => {
      toast({
        title: "Pripomienka vytvorená!"
      })
    },
    onError: (err: AxiosError<{message: string}>, newTaskReminder, context?: any) => {
      const errMessage = err.response?.data ? err.response.data.message : err.message

      toast({
        title: "Chyba",
        description: errMessage
      })

      queryClient.setQueryData(taskReminderQueryKeys.all, context.previousTaskReminder)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskReminderQueryKeys.all })
    }
  })
}

export const useDeleteTaskReminder = (id: number) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const deleteTaskReminderFn = async () => {
        const response = await taskRemindersApiClient.delete(`/${id}`);
        return response.data;
    };

    return useMutation({
        mutationFn: deleteTaskReminderFn,
        onMutate: async () => {
        if (!confirm("Určite to chcete vymazať?")) {
            throw new Error('Nič nebolo vymazané');
        }
        await queryClient.cancelQueries({ queryKey: taskReminderQueryKeys.detail(id) });
        const previousUser = queryClient.getQueryData(taskReminderQueryKeys.detail(id));
        queryClient.removeQueries({ queryKey: taskReminderQueryKeys.detail(id) });
        return { previousUser };
        },
        onSuccess: () => {
        toast({
            title: 'Pripomienka vymazaná z databázy!',
        });
        },
        onError: (err: AxiosError<{ message: string }>, _, context?: any) => {
        const errMessage = err.response?.data ? err.response.data.message : err.message;
        toast({
            title: 'Chyba',
            description: errMessage,
        });

        queryClient.setQueryData(taskReminderQueryKeys.detail(id), context.previousUser);
        },
        onSettled: () => {
        queryClient.invalidateQueries({ queryKey: taskReminderQueryKeys.all });
        },
    });
}