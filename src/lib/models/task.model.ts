import { z } from "zod";
import { ModelColumns } from "../utils/api.utils";


export const TASK_COLUMNS_PATHS: {[key: string]: (value: any) => any} = {
  name: (value) => ({name: value}),
  createdAt: (value) => ({createdAt: value}),
  status: (value) => ({status: value}),
  priority: (value) => ({priority: value}),
  deadline: (value) => ({deadline: value}),
  creator_name: (value) => ({creator: {user: {name: value}}}),
  assignee_name: (value) => ({assignee: {user: {name: value}}}),
  organization_name: (value) => ({organization: {name: value}}),
}

export const TASK_PRIORITIES_MAP = {
  "LOW": "Nízka",
  "MEDIUM": "Stredná",
  "HIGH": "Vysoká",
  "CRITICAL": "Kritická"
}

export const TASK_STATUSES_MAP = {
  "TODO": "Zadaná",
  "WAITING": "Čaká",
  "INPROGRESS": "V procese",
  "CHECKREQ": "Na kontrolu",
  "DONE": "Hotová"
}


export const TaskSchema = z.object({
  id: z.number().int().optional(), 
  name: z.string().min(1, "Názov je povinný"),
  status: z.enum(["TODO", "INPROGRESS", "WAITING", "CHECKREQ", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().max(500, "Popis nemôže presiahnuť 500 znakov.").optional().default(''),
  parent_id: z.number().nullable(),
  organization_id: z.number().optional(),
  creator_id: z.number().optional(),
  assignee_id: z.number({message: "Zadajte zodpovednú osobu"}),
  source: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updateAt: z.coerce.date().optional(),
  deadline: z.coerce.date(),
  completition_date: z.coerce.date().optional(),
});


export const CreateTaskSchema = TaskSchema.omit({ id: true });
export const TaskUpdateSchema = TaskSchema.partial().merge(z.object({ id: z.number() }));

export type Task = z.infer<typeof TaskSchema>  & {id: number};

export const taskColumns: ModelColumns = {
  'name': {
    type: 'string',
    method: 'contains',
    label: 'Názov'
  },
  'createdAt': {
    label: "Vznik",
    type: 'datetime',
  },
  'priority': {
    type: 'enum',
    label: "Priorita",
    enum: TASK_PRIORITIES_MAP
  },
  'status': {
    type: 'enum',
    path: 'status',
    label: "Status",
    enum: TASK_STATUSES_MAP
  },
  'deadline': {
    label: "Termín dokončenia",
    type: 'datetime',
  },
  'creator_name': {
    label: "Vytvárateľ",
    type: 'string',
    path: 'creator.user.name',
    method: 'contains'
  },
  'assignee_name': {
    label: "Zodpovedná osoba",
    type: 'string',
    path: 'assignee.user.name',
    method: 'contains'
  },
  // 'organization_name': {
  //   label: "Organizácia",
  //   type: 'string',
  //   path: 'organization.name',
  //   method: 'contains'
  // },
  'source': {
    label: "Zdroj",
    type: 'string',
    path: 'source',
    method: 'contains'
  },
  "parent_id": {
    type: "number",
    method: "equals"
  },
  'fulltext': {
    type: 'string',
    customFilter: (val) => ({OR: [
      {name: {contains: val}}
    ]})
  },
}