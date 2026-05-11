'use client'
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TASK_STATUSES_MAP } from "@/lib/models/task.model";
import { useDeleteTaskSubscription, useMyTaskSubscription, useUpsertTaskSubscription } from "@/lib/hooks/task/taskSubscription.hooks";
import { TaskStatus } from "@prisma/client";
import { BellIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const ALL_STATUSES = Object.keys(TASK_STATUSES_MAP) as TaskStatus[];

export default function TaskStatusNotifications({ task_id }: { task_id: number }) {
  const subQuery = useMyTaskSubscription(task_id);
  const upsertMutation = useUpsertTaskSubscription(task_id);
  const deleteMutation = useDeleteTaskSubscription(task_id);

  const subscription = subQuery.data;
  const subscribedStatuses: TaskStatus[] = subscription?.statuses ?? [];

  const handleToggle = (status: TaskStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...subscribedStatuses, status]
      : subscribedStatuses.filter((s) => s !== status);

    if (newStatuses.length === 0 && subscription?.id) {
      deleteMutation.mutate(subscription.id);
    } else {
      upsertMutation.mutate(newStatuses);
    }
  };

  if (subQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Spinner className="size-4" />
        <span className="text-sm text-muted-foreground">Načítava sa...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BellIcon size={14} />
        <span className="text-sm font-medium">Emailové notifikácie pri zmene stavu</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Dostanete emailovú notifikáciu keď sa stav úlohy zmení na označený stav.
      </p>
      <div className="space-y-2">
        {ALL_STATUSES.map((status) => {
          const isChecked = subscribedStatuses.includes(status);
          const isPending = upsertMutation.isPending || deleteMutation.isPending;
          return (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`sub-status-${status}`}
                checked={isChecked}
                disabled={isPending}
                onCheckedChange={(checked) => handleToggle(status, !!checked)}
              />
              <Label
                htmlFor={`sub-status-${status}`}
                className="text-sm cursor-pointer"
              >
                {TASK_STATUSES_MAP[status]}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
