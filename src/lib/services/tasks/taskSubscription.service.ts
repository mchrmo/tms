import prisma from "../../prisma";
import { TaskStatus } from "@prisma/client";
import { TaskSubscriptionCreate, TaskSubscriptionUpdate, deserializeStatuses, serializeStatuses } from "../../models/taskSubscription.model";

export const taskSubscriptionListItem = {
  include: {
    member: {
      select: {
        id: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    }
  }
} as const;

export type TaskSubscriptionListItem = {
  id: number;
  task_id: number;
  member_id: number;
  statuses: TaskStatus[];
  member: {
    id: number;
    user: { id: number; name: string; email: string };
  };
};

const get_taskSubscription = async (id: number) => {
  const sub = await prisma.taskSubscription.findUnique({
    where: { id },
    ...taskSubscriptionListItem,
  });
  if (!sub) return null;
  return { ...sub, statuses: deserializeStatuses(sub.statuses) };
};

const get_taskSubscription_byMember = async (task_id: number, member_id: number) => {
  const sub = await prisma.taskSubscription.findUnique({
    where: { task_id_member_id: { task_id, member_id } },
    ...taskSubscriptionListItem,
  });
  if (!sub) return null;
  return { ...sub, statuses: deserializeStatuses(sub.statuses) };
};

const get_taskSubscriptions = async (task_id: number) => {
  const subs = await prisma.taskSubscription.findMany({
    where: { task_id },
    ...taskSubscriptionListItem,
  });
  return subs.map(s => ({ ...s, statuses: deserializeStatuses(s.statuses) }));
};

/** Returns all subscriptions for a task that include the given status, with user emails. */
const get_subscribers_for_status = async (task_id: number, status: TaskStatus) => {
  const subs = await prisma.taskSubscription.findMany({
    where: { task_id },
    include: {
      member: {
        select: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  return subs
    .filter(s => deserializeStatuses(s.statuses).includes(status))
    .map(s => s.member.user);
};

const upsert_taskSubscription = async (data: TaskSubscriptionCreate) => {
  const statusStr = serializeStatuses(data.statuses as TaskStatus[]);

  const sub = await prisma.taskSubscription.upsert({
    where: { task_id_member_id: { task_id: data.task_id, member_id: data.member_id } },
    create: {
      task_id: data.task_id,
      member_id: data.member_id,
      statuses: statusStr,
    },
    update: {
      statuses: statusStr,
    },
    ...taskSubscriptionListItem,
  });

  return { ...sub, statuses: deserializeStatuses(sub.statuses) };
};

const update_taskSubscription = async (data: TaskSubscriptionUpdate) => {
  const statusStr = serializeStatuses(data.statuses as TaskStatus[]);

  const sub = await prisma.taskSubscription.update({
    where: { id: data.id },
    data: { statuses: statusStr },
    ...taskSubscriptionListItem,
  });

  return { ...sub, statuses: deserializeStatuses(sub.statuses) };
};

const delete_taskSubscription = async (id: number) => {
  return prisma.taskSubscription.delete({ where: { id } });
};

const taskSubscriptionService = {
  get_taskSubscription,
  get_taskSubscription_byMember,
  get_taskSubscriptions,
  get_subscribers_for_status,
  upsert_taskSubscription,
  update_taskSubscription,
  delete_taskSubscription,
};

export default taskSubscriptionService;
