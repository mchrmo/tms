import { ModelColumns } from "@/lib/utils/api.utils";
import { z } from "zod";


const OrganizationMemberSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  name: z.string().min(1, "Názov je povinný"),
  user_id: z.number(),
  manager_id: z.number().nullable(),
  organization_id: z.number(),
  position_name: z.string().min(1, 'Názov pozície je povinný')
});


export type ZOrganizationMember = z.infer<typeof OrganizationMemberSchema>;

export const OrganizationMemberCreateSchema = OrganizationMemberSchema.omit({
  id: true, // Remove id for creation
});

export type ZOrganizationMemberCreateForm = z.infer<typeof OrganizationMemberCreateSchema>;

export const OrganizationMemberUpdateSchema = OrganizationMemberSchema.partial().merge(z.object({ id: z.number() }));

// Zod type for UpdateForm
export type ZOrganizationMemberUpdateForm = z.infer<typeof OrganizationMemberUpdateSchema>;
