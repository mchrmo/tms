import { z } from 'zod';


const MeetingAttendantAttendantSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  user_id: z.number().min(1, "User is required"),
  meeting_id: z.number(),
  // role: z.string().optional(), // Validate date field
});

export const attendantsRolesMap: {[key: string]: string} = {
  "CREATOR": "Vytvárateľ",
  "ATTENDANT": 'Účastník'
}


export type ZMeetingAttendant = z.infer<typeof MeetingAttendantAttendantSchema>;

export const MeetingAttendantCreateSchema = MeetingAttendantAttendantSchema.omit({
  id: true, // Remove id for creation
});

export type ZMeetingAttendantCreateForm = z.infer<typeof MeetingAttendantCreateSchema>;
