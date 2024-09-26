import { Prisma, Task, TaskReminder, TaskUpdate, User } from "@prisma/client"
import prisma from "../prisma"
import moment from "moment";
import path from "path";
import fs from 'fs';
import handlebars from 'handlebars';
import { sendReport } from "./mail.service";
import { format } from "date-fns";
import { formatDate, formatDateTime } from "../utils/dates";

handlebars.registerHelper('dateTime', function (dateString: string) {
  return formatDateTime(new Date(dateString))
})



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

    let reportToSend
    if(type == 'morning') reportToSend = await morning_user_report(user)
    if(type == 'afternoon') reportToSend = await afternoon_user_report(user)
      
    if(reportToSend) await sendReport(user.email, reportToSend.title, reportToSend.html)
      
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


  
  const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', 'morning-report.html');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);

  const title = `Ranný report ${formatDate(reportDate)}`

  const html = template({
    url: process.env.NEXT_PUBLIC_URL,
    title: title,
    deadlineTasks,
    reminders,
    updates,
    user,
  });

  
  // console.log(htmlToSend);
  
  return {html, title}
  // await sendReport(user.email, title, htmlToSend)

}

const afternoon_user_report = async (user: ReportedUser) => {
  const reportDate = new Date()

  const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', 'afternoon-report.html');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);

  const title = `Poobedný report ${formatDate(reportDate)}`


  let updates: {creator_id: TaskUpdate[], assignee_id: TaskUpdate[]} = {
    creator_id: [],
    assignee_id: [],
  }
  let nextDayDeadlines: {creator_id: Task[], assignee_id: Task[]} = {
    creator_id: [],
    assignee_id: [],
  }

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
        deadline: {
          gte: moment().toDate(),
          lt: moment().add(1, 'day').toDate()
        }
      }
    })


    nextDayDeadlines.creator_id = nextDayDeadlines.creator_id.concat(memberDeadlineTasks.filter(t => t.creator_id == memberId && t.creator_id !== t.assignee_id))
    nextDayDeadlines.assignee_id = nextDayDeadlines.assignee_id.concat(memberDeadlineTasks.filter(t => t.assignee_id == memberId && t.creator_id !== t.assignee_id))

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

    updates.creator_id = updates.creator_id.concat(memberUpdates.filter(t => t.task.creator_id == memberId && t.task.creator_id !== t.task.assignee_id))
    updates.assignee_id = updates.assignee_id.concat(memberUpdates.filter(t => t.task.assignee_id == memberId && t.task.creator_id !== t.task.assignee_id))

  }



  const html = template({
    url: process.env.NEXT_PUBLIC_URL,
    title: title,
    user,
    updates,
    nextDayDeadlines
  });


  return {html, title}
}


const reportService = {
  process_reports,
  morning_user_report,
  afternoon_user_report
}

export default reportService