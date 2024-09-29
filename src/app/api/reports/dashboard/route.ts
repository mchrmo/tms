import prisma from "@/lib/prisma";
import { errorHandler } from "@/lib/services/api.service";
import userService from "@/lib/services/user.service";
import { subDays } from "date-fns";
import { ApiError } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";



const fetchNextMeeting = async (user_id: number) => {
  const nextMeeting = await prisma.meeting.findFirst({
    where: {
      attendants: {
        some: {
          user_id
        }
      }
    },
    orderBy: {
      date: "asc"
    }
  })
  return nextMeeting
}

const fetchUnfinishedTasks = async (user_id: number) => {
  const ownedTasksCount = await prisma.task.count({
    where: {
      creator: {
        user_id
      },
      status: { notIn: ["DONE", "CHECKREQ"] },
    },
  });

  const assignedTasksCount = await prisma.task.count({
    where: {
      assignee: {
        user_id
      },
      status: {notIn: ["DONE", "CHECKREQ"]},
    },
  });

  return {
    owned: ownedTasksCount,
    assigned: assignedTasksCount,
  };
};

// Fetch reminder count for today and the next day
const fetchRemindersCount = async (user_id: number) => {
  const today = new Date();
  const tomorrow = subDays(today, -1);

  const todayRemindersCount = await prisma.taskReminder.count({
    where: {
      member: {user_id},
      datetime: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const nextDayRemindersCount = await prisma.taskReminder.count({
    where: {
      member: {user_id},
      datetime: {
        gte: tomorrow,
        lt: subDays(tomorrow, -1),
      },
    },
  });

  return {
    today: todayRemindersCount,
    nextDay: nextDayRemindersCount,
  };
};

// Fetch task deadlines count for today and the next day
const fetchDeadlinesCount = async (user_id: number) => {
  const today = new Date();
  const tomorrow = subDays(today, -1);

  const todayDeadlinesCount = await prisma.task.count({
    where: {
      assignee: {user_id},
      deadline: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const nextDayDeadlinesCount = await prisma.task.count({
    where: {
      assignee: {user_id},
      deadline: {
        gte: tomorrow,
        lt: subDays(tomorrow, -1),
      },
    },
  });

  return {
    today: todayDeadlinesCount,
    nextDay: nextDayDeadlinesCount,
  };
};

// Fetch task counts by status for a specific user
const fetchTaskStatusCounts = async (user_id: number) => {
  
  const taskCounts = await prisma.task.groupBy({
    by: ['status'],
    where: {
      OR: [
        { assignee: {user_id} },
      ],
    },
    _count: {
      status: true,
    },
  });

  // Map the result into an object with status as keys
  const taskStatusCounts = {
    TODO: 0,
    WAITING: 0,
    INPROGRESS: 0,
    CHECKREQ: 0,
    DONE: 0,
  };

  // Populate the counts from the groupBy result
  taskCounts.forEach((item) => {
    taskStatusCounts[item.status] = item._count.status;
  });

  return taskStatusCounts;
}


export const GET = errorHandler(async (req: NextRequest) => {

  const params = req.nextUrl.searchParams

  const user = await userService.get_current_user();
  if(!user) throw new ApiError(403, "No user")
    
  // const user_id = user?.id
  const user_id = 16

  const nextMeeting = await fetchNextMeeting(user_id)

  const unfinishedTasksCount = await fetchUnfinishedTasks(user_id)
  const remindersCounts = await fetchRemindersCount(user_id)
  const deadlinesCounts = await fetchDeadlinesCount(user_id)
  const taskStatusCounts = await fetchTaskStatusCounts(user_id)

  const reports = {
    nextMeeting,
    unfinishedTasksCount,
    remindersCounts,
    deadlinesCounts,
    taskStatusCounts
  };

  return NextResponse.json(reports, { status: 200 })
})