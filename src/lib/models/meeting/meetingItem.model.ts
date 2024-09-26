import { z } from 'zod';

// MeetingItemStatus Enum (Assumed to be string values, change as needed)
export const MeetingItemStatusEnum = z.enum(['DRAFT', 'PENDING', 'DENIED', 'ACCEPTED']);
export const meetingItemStatusMap: {[key: string]: string} = {
  "DRAFT": "Koncept",
  "PENDING": 'Čaká na schválenie',
  "DENIED": 'Zamietnutý',
  "ACCEPTED": 'Schválený'
}
const MeetingItemSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  status: MeetingItemStatusEnum.default('DRAFT'), // Defaults to 'DRAFT'
  description: z.string().min(1, "Description is required"),
  meeting_id: z.number().min(1, "Meeting ID is required and should be a positive number"),
  creator_id: z.number().optional(), // Optional because creator may not exist yet (nullable)
  // comments: z.array(z.any()).optional(), // Assuming comments will be added later
});

// Zod type from the schema
export type ZMeetingItem = z.infer<typeof MeetingItemSchema>;


export const MeetingItemCreateSchema = MeetingItemSchema.omit({
  id: true, // Remove id for creation
});

// Zod type for CreateForm
export type ZMeetingItemCreateForm = z.infer<typeof MeetingItemCreateSchema>;


export const MeetingItemUpdateSchema = MeetingItemSchema.partial().merge(z.object({ id: z.number() }));

// Zod type for UpdateForm
export type ZMeetingItemUpdateForm = z.infer<typeof MeetingItemUpdateSchema>;

