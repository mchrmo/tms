import { z } from 'zod';

// Base schema for TaskComment
const TaskCommentchema = z.object({
  id: z.number().optional(), // id is optional for create form (autoincrement)
  task_id: z.number().min(1, "Task ID is required and should be a positive number"),
  creator_id: z.number(),
  message: z.string().min(1, "Message is required"),
});



export const TaskCommentCreateSchema = TaskCommentchema.omit({ id: true, creator_id: true });
export const TaskCommentCreateServiceSchema = TaskCommentchema.omit({ id: true });

export const TaskCommentUpdateSchema = TaskCommentchema.partial().merge(z.object({ id: z.number() }));

export type Task = z.infer<typeof TaskCommentchema>  & {id: number};

