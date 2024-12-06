import { ModelColumns } from '@/lib/utils/api.utils';
import { z } from 'zod';



const MeetingSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  name: z.string().min(1, "Name is required"),
  date: z.coerce.date({ invalid_type_error: "Invalid date format" }), // Validate date field
});


export type ZMeeting = z.infer<typeof MeetingSchema>;

export const MeetingCreateSchema = MeetingSchema.omit({
  id: true, // Remove id for creation
});

export type ZMeetingCreateForm = z.infer<typeof MeetingCreateSchema>;

export const MeetingUpdateSchema = MeetingSchema.partial().merge(z.object({ id: z.number() }));

// Zod type for UpdateForm
export type ZMeetingUpdateForm = z.infer<typeof MeetingUpdateSchema>;

export const meetingColumns: ModelColumns = {
  'name': {
    type: 'string',
    method: 'contains',
    label: 'Názov'
  },
  'date': {
    label: "Dátum",
    type: 'datetime',
  },
  'attendantsCount': {
    type: 'number',
    path: 'attendants._count',
    disableFilter: true
  },
  'itemsCount': {
    type: 'number',
    path: 'items._count',
    disableFilter: true
  }
}


export type MeetingUserRole = "ATTENDANT" | "CREATOR"