import { ModelColumns } from "@/lib/utils/api.utils";
import { z } from "zod";


const OrganizationSchema = z.object({
  id: z.number().optional(), // Optional for creation (auto-increment)
  name: z.string().min(1, "Názov je povinný"),
  parent_id: z.number().nullable(),
});


export type ZOrganization = z.infer<typeof OrganizationSchema>;

export const OrganizationCreateSchema = OrganizationSchema.omit({
  id: true, // Remove id for creation
});

export type ZOrganizationCreateForm = z.infer<typeof OrganizationCreateSchema>;

export const OrganizationUpdateSchema = OrganizationSchema.partial().merge(z.object({ id: z.number() }));

// Zod type for UpdateForm
export type ZOrganizationUpdateForm = z.infer<typeof OrganizationUpdateSchema>;

export const organizationColumns: ModelColumns = {
  'name': {
    type: 'string',
    method: 'contains',
    label: 'Názov'
  },
  'parent': {
    type: 'string',
    method: 'contains',
    path: "parent.name",
    label: "Nadriadená org."
  },
  'parentId': {
    type: 'number',
    method: 'equals',
    path: "parent_id"
  }
}