import tasksController from "@/lib/controllers/tasks.controller";
import { getTaskList } from "@/lib/db/task.repository";
import { getUserByClerkId } from "@/lib/db/user.repository";
import { TASK_COLUMNS_PATHS } from "@/lib/models/task.model";
import prisma from "@/lib/prisma";
import { errorHandler } from "@/lib/services/api.service";
import { auth } from "@clerk/nextjs/server";
import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { parseArgs } from "util";
import { z } from "zod";


export const GET = errorHandler(tasksController.getTasks)

export const POST = errorHandler(tasksController.createTask)

export const PATCH = errorHandler(tasksController.updateTask)
