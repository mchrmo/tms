import { NextRequest, NextResponse } from "next/server";
import { getUser, getMembership } from "@/lib/services/auth.service";
import { unauthorizedError } from "@/lib/utils/api.utils";
import { TaskSubscriptionCreateSchema, TaskSubscriptionUpdateSchema } from "../../models/taskSubscription.model";
import taskSubscriptionService from "../../services/tasks/taskSubscription.service";
import taskRelService from "../../services/tasks/taskRelationship.service";
import { isRole } from "@/lib/services/auth.service";

const getTaskSubscriptions = async (req: NextRequest) => {
  const task_id = parseInt(req.nextUrl.searchParams.get('task_id') || '0');
  if (!task_id) return NextResponse.json({ error: 'task_id je povinné' }, { status: 400 });

  const user = await getUser();
  if (!user) throw unauthorizedError;

  const isAdmin = await isRole('admin', user);

  if (!isAdmin) {
    const rel = await taskRelService.get_taskRelationship(task_id, user.id);
    if (!rel) throw unauthorizedError;
  }

  const subs = await taskSubscriptionService.get_taskSubscriptions(task_id);
  return NextResponse.json(subs, { status: 200 });
};

const getMyTaskSubscription = async (req: NextRequest) => {
  const task_id = parseInt(req.nextUrl.searchParams.get('task_id') || '0');
  if (!task_id) return NextResponse.json({ error: 'task_id je povinné' }, { status: 400 });

  const user = await getUser();
  if (!user) throw unauthorizedError;

  const membership = await getMembership(user.id);
  if (!membership) throw unauthorizedError;

  const sub = await taskSubscriptionService.get_taskSubscription_byMember(task_id, membership.id);
  return NextResponse.json(sub ?? null, { status: 200 });
};

const upsertTaskSubscription = async (req: NextRequest) => {
  const body = await req.json();

  const user = await getUser();
  if (!user) throw unauthorizedError;

  const membership = await getMembership(user.id);
  if (!membership) throw unauthorizedError;

  // Enforce that a user can only manage their own subscription
  const parseData = { ...body, member_id: membership.id };
  const parsed = TaskSubscriptionCreateSchema.safeParse(parseData);

  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Neplatné dáta", errors: parsed.error.errors } }, { status: 400 });
  }

  const isAdmin = await isRole('admin', user);
  if (!isAdmin) {
    const rel = await taskRelService.get_taskRelationship(parsed.data.task_id, user.id);
    if (!rel) throw unauthorizedError;
  }

  const sub = await taskSubscriptionService.upsert_taskSubscription(parsed.data);
  return NextResponse.json(sub, { status: 200 });
};

const deleteTaskSubscription = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id);

  const user = await getUser();
  if (!user) throw unauthorizedError;

  const membership = await getMembership(user.id);
  if (!membership) throw unauthorizedError;

  const existing = await taskSubscriptionService.get_taskSubscription(id);
  if (!existing) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 });

  const isAdmin = await isRole('admin', user);
  if (!isAdmin && existing.member_id !== membership.id) throw unauthorizedError;

  const sub = await taskSubscriptionService.delete_taskSubscription(id);
  return NextResponse.json(sub, { status: 200 });
};

const taskSubscriptionsController = {
  getTaskSubscriptions,
  getMyTaskSubscription,
  upsertTaskSubscription,
  deleteTaskSubscription,
};

export default taskSubscriptionsController;
