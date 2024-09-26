import { z } from 'zod';

const MeetingItemCommentSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  message: z.string().min(1, "Message is required"),
  item_id: z.number().min(1, "Meeting ID is required and should be a positive number"),
  creator_id: z.number().optional(), // Optional because creator may not exist yet (nullable)
});

// Zod type from the schema
export type ZMeetingItemComment = z.infer<typeof MeetingItemCommentSchema>;


export const MeetingItemCommentCreateSchema = MeetingItemCommentSchema.omit({
  id: true, // Remove id for creation
});

// Zod type for CreateForm
export type ZMeetingItemCommentCreateForm = z.infer<typeof MeetingItemCommentCreateSchema>;


export const MeetingItemCommentUpdateSchema = MeetingItemCommentSchema.partial().merge(z.object({ id: z.number() }));

// Zod type for UpdateForm
export type ZMeetingItemCommentUpdateForm = z.infer<typeof MeetingItemCommentUpdateSchema>;
