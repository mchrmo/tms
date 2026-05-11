import { getApiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";

const subscriptionsApiClient = getApiClient('/tasks/subscriptions');

export const taskSubscriptionQueryKeys = {
  all: ['taskSubscriptions'],
  mine: (task_id: number) => [...taskSubscriptionQueryKeys.all, 'mine', task_id],
};

export const useMyTaskSubscription = (task_id: number) => {
  return useQuery({
    queryKey: taskSubscriptionQueryKeys.mine(task_id),
    queryFn: async () => {
      const res = await subscriptionsApiClient.get('', { params: { task_id } });
      return res.data as { id: number; statuses: TaskStatus[] } | null;
    },
    enabled: !!task_id,
  });
};

export const useUpsertTaskSubscription = (task_id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (statuses: TaskStatus[]) => {
      const res = await subscriptionsApiClient.post('', { task_id, statuses });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskSubscriptionQueryKeys.mine(task_id) });
      toast({ title: "Notifikácie uložené" });
    },
    onError: () => {
      toast({ title: "Chyba", description: "Nepodarilo sa uložiť notifikácie", variant: "destructive" });
    },
  });
};

export const useDeleteTaskSubscription = (task_id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await subscriptionsApiClient.delete(`/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskSubscriptionQueryKeys.mine(task_id) });
      toast({ title: "Notifikácie zrušené" });
    },
    onError: () => {
      toast({ title: "Chyba", description: "Nepodarilo sa zrušiť notifikácie", variant: "destructive" });
    },
  });
};
