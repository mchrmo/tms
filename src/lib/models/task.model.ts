

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
