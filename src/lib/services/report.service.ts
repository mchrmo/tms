import { Prisma, Task, TaskReminder, TaskUpdate, User } from "@prisma/client"
import prisma from "../prisma"
import moment from "moment";
import path from "path";
import fs from 'fs';
import handlebars from 'handlebars';
import { sendReport } from "./mail.service";
import { format } from "date-fns";
import { formatDate, formatDateTime } from "../utils/dates";

export const user = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    OrganizationMember: {
      select: { id: true }
    }
  }
})
export type ReportedUser = Prisma.UserGetPayload<typeof user>


const process_reports = async (type: 'morning' | 'afternoon') => {

  const users = await prisma.user.findMany({
    where: {
      role: {
        name: 'employee'
      }
    },
    include: {
      OrganizationMember: {
        select: { id: true }
      }
    }
  })


  for (const user of users) {
    if (!user.OrganizationMember.length) continue

    if(type == 'morning') morning_user_report(user)
  }


}

const morning_user_report = async (user: ReportedUser) => {

  const reportDate = new Date()

  let deadlineTasks: {
    creator_id: Task[],
    assignee_id: Task[],
    personal: Task[]
  } = {
    creator_id: [],
    assignee_id: [],
    personal: []
  }
  let reminders: {
    creator_id: TaskReminder[],
    assignee_id: TaskReminder[],
  } = {
    creator_id: [],
    assignee_id: [],
  }
  let updates: TaskUpdate[] = []
  let watchedTasks: Task[] = []


  for (const { id: memberId } of user.OrganizationMember) {

    const memberDeadlineTasks = await prisma.task.findMany({
      where: {
        OR: [
          {creator_id: memberId},
          {assignee_id: memberId}
        ],
        status: {
          not: "DONE"
        },
        completition_date: null,
        deadline: {
          gte: moment().toDate(),
          lt: moment().add(1, 'day').toDate()
        }
      }
    })

    deadlineTasks.creator_id = deadlineTasks.creator_id.concat(memberDeadlineTasks.filter(t => t.creator_id == memberId && t.creator_id !== t.assignee_id))
    deadlineTasks.assignee_id = deadlineTasks.assignee_id.concat(memberDeadlineTasks.filter(t => t.assignee_id == memberId && t.creator_id !== t.assignee_id))
    deadlineTasks.personal = deadlineTasks.personal.concat(memberDeadlineTasks.filter(t => t.assignee_id == memberId && t.creator_id === t.assignee_id))

    const memberRemindersCreator = await prisma.taskReminder.findMany({
      where: {
        task: {
          creator_id: memberId
        },
        OR: [
          {member_id: memberId},
          {member_id: null}
        ],
        datetime: {
          gte: moment().toDate(),
          lt: moment().add(1, 'day').toDate()
        }
      }
    })

    const memberRemindersAssignee = await prisma.taskReminder.findMany({
      where: {
        task: {
          assignee_id: memberId
        },
        OR: [
          {member_id: memberId},
          {member_id: null}
        ],
        datetime: {
          gte: moment().toDate(),
          lt: moment().add(1, 'day').toDate()
        }
      }
    })
    reminders.creator_id = reminders.creator_id.concat(memberRemindersCreator)
    reminders.assignee_id = reminders.assignee_id.concat(memberRemindersAssignee)


    const memberUpdates = await prisma.taskUpdate.findMany({
      where: {
        task: {
           OR: [
            {creator_id: memberId},
            {assignee_id: memberId}
          ]
        },
        createdAt: {
          gt: moment().subtract(1, 'day').toDate()
        }
      },
      include: {
        task: true
      }
    })
    updates = updates.concat(memberUpdates)
  }

  handlebars.registerHelper('dateTime', function (dateString: string) {
    return formatDateTime(new Date(dateString))
  })

  
  const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', 'morning-report.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);

  const title = `Ranný report ${formatDate(reportDate)}`

  const htmlToSend = template({
    url: process.env.NEXT_PUBLIC_URL,
    title: title,
    deadlineTasks,
    reminders,
    updates
  });

  
  console.log(htmlToSend);
  
  sendReport(user.email, title, htmlToSend)

}


const reportService = {
  process_reports
}

export default reportService