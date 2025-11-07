import { Task, User, Organization } from "@prisma/client";
import { PaginatedResponse } from "../services/api.service";

export interface TaskWithRelations extends Task {
  assignee: {
    user: {
      name: string;
    };
  } | null;
  creator: {
    user: {
      name: string;
    };
  };
  organization: {
    name: string;
  };
  _count: {
    SubTasks: number;
  };
  parent_role?: 'CREATOR' | 'ASSIGNEE' | 'VIEWER' | null;
}

export type TasksResponse = PaginatedResponse<TaskWithRelations>;

export interface TaskDetailResponse {
  role: 'ADMIN' | 'CREATOR' | 'ASSIGNEE' | 'VIEWER';
  data: TaskWithRelations;
}
