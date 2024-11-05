import { ModelColumns } from "@/lib/utils/api.utils";
import { z } from "zod";


const OrganizationMemberSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  user_id: z.number(),
  manager_id: z.number().nullable(),
  organization_id: z.number(),
  position_name: z.string({required_error: "Názov pozície je povinný"})
});


export type ZOrganizationMember = z.infer<typeof OrganizationMemberSchema>;

export const OrganizationMemberCreateSchema = OrganizationMemberSchema.omit({
  id: true, // Remove id for creation
});

export type ZOrganizationMemberCreateForm = z.infer<typeof OrganizationMemberCreateSchema>;

export const OrganizationMemberUpdateSchema = OrganizationMemberSchema.partial().merge(z.object({ id: z.number() }));

// Zod type for UpdateForm
export type ZOrganizationMemberUpdateForm = z.infer<typeof OrganizationMemberUpdateSchema>;

export const organizationMemberColumns: ModelColumns = {
  'name': {
    type: 'string',
    path: 'user.name',
    method: 'contains'
  },
  'fulltext': {
    type: 'string',
    customFn: (val) => ({OR: [
      {name: {contains: val}}
    ]})
  },
}