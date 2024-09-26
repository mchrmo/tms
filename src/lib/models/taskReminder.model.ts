import { z } from 'zod';

// Base schema for TaskReminder
const TaskReminderSchema = z.object({
  id: z.number().optional(), // id is optional for create form (autoincrement)
  task_id: z.number().min(1, "Task ID is required and should be a positive number"),
  member_id: z.number().nullable().optional(),
  description: z.string().min(1, "Description is required"),
  datetime: z.coerce.date()
});



export const TaskReminderCreateSchema = TaskReminderSchema.omit({ id: true });
export const TaskReminderUpdateSchema = TaskReminderSchema.partial().merge(z.object({ id: z.number() }));

export type Task = z.infer<typeof TaskReminderSchema>  & {id: number};

