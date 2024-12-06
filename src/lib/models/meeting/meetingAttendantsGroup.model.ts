import { z } from 'zod';


const MeetingAttendantsGroupSchema = z.object({
  id: z.number().optional(), 
  name: z.string(),
  creator_id: z.number().min(1, "Creator is required"),
});


export type ZMeetingAttendantsGroup = z.infer<typeof MeetingAttendantsGroupSchema>;

export const MeetingAttendantsGroupCreateSchema = MeetingAttendantsGroupSchema.omit({
  id: true, // Remove id for creation
});

export const MeetingAttendantsGroupUpdateSchema = z.object({
  id: z.number().optional(), 
  name: z.string(),
});

// Zod type for UpdateForm
export type ZMeetingAttendantsGroupUpdateForm = z.infer<typeof MeetingAttendantsGroupUpdateSchema>;


export type ZMeetingAttendantsGroupCreateForm = z.infer<typeof MeetingAttendantsGroupCreateSchema>;
