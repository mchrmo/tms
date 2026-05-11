import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const TASK_STATUSES = ['TODO', 'WAITING', 'INPROGRESS', 'CHECKREQ', 'DONE'] as const;

const TaskSubscriptionSchema = z.object({
  id: z.number().optional(),
  task_id: z.number().min(1, "Task ID je povinné"),
  member_id: z.number().min(1, "Member ID je povinné"),
  statuses: z.array(z.enum(TASK_STATUSES)).default([]),
});

export const TaskSubscriptionCreateSchema = TaskSubscriptionSchema.omit({ id: true });
export const TaskSubscriptionUpdateSchema = z.object({
  id: z.number(),
  statuses: z.array(z.enum(TASK_STATUSES)),
});

export type TaskSubscriptionCreate = z.infer<typeof TaskSubscriptionCreateSchema>;
export type TaskSubscriptionUpdate = z.infer<typeof TaskSubscriptionUpdateSchema>;

export function serializeStatuses(statuses: TaskStatus[]): string {
  return statuses.join(',');
}

export function deserializeStatuses(value: string): TaskStatus[] {
  if (!value) return [];
  return value.split(',').filter(Boolean) as TaskStatus[];
}
