'use server'

// TWILIO BPS68FDK5PQVZ2VLLW6UKQ3C
import Email from "vercel-email";
import { getUser, getUserByClerkId } from "../db/user.repository";
import { formatDateTime } from "../utils/dates";
import { Meeting } from "@prisma/client";

const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

// const mailService = nodemailer.createTransport({
//   host: 'mail.webglobe.sk',
//   port: 465,
//   auth: {
//       user: 'system@taskmanager.sk',
//       pass: 'MGreenlord3'
//   },
//   secure: true
// })

type SengridEmailParams = {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(email: SengridEmailParams) {
  if (!email.from) email.from = "system@taskmanager.sk"

    if (process.env.DISABLE_EMAIL && email.to !== 'mchrmo@gmail.com') {
      console.log("Email not send - disabled", email.to)
      return
    }
  try {

    email.html += `<br> <br> <i style="color: #7e7e7e;">Email je automaticky generovaný, prosím neodpovedajte naň.</i>`


    return await sgMail.send(email)
  } catch (error) {
    console.error(error);

  }
}


export async function sendWelcomeEmail(email: string, login: string, password: string) {

  console.log("Sending email to ", email);

  const url = process.env.NEXT_PUBLIC_URL


  await sendEmail({
    from: 'system@taskmanager.sk',
    to: email,
    subject: `Vitajte v systéme TMS mesta Ružomberok`,
    html: `
      <h2>Pre prihlásenie použite nasledovné údaje: </h2>
      <p style="margin: 0">Email: <b>${login}</b> </p>
      <p style="margin: 0">Heslo: <b>${password}</b> </p>
      <p>Prosím prihláste sa tu: <a href="${url}/sign-in">${url}</a></p>
    `
  })


}

export async function sendAssigneeChangeNotification(user_id: number, taskName: string, task_id: number) {

  const user = await getUser(user_id)
  if (!user) return
  const text = `Bola Vám pridelená úloha: <a href="${process.env.NEXT_PUBLIC_URL}/tasks/${task_id}"><b>${taskName}</b></a>`
  console.log("Sending email to ", user?.email);

  const email = await sendEmail({
    from: 'system@taskmanager.sk',
    to: user?.email,
    subject: `Bola Vám pridelená úloha - ${taskName}`,
    html: text
  })
}

export async function sendReport(email: string, subject: string, report: string) {

  const mail = await sendEmail({
    from: 'system@taskmanager.sk',
    to: email,
    subject,
    html: report
  })


}

// Meetings
export async function newMeetingAttendantEmail(user_id: number, meeting: Meeting) {

  const user = await getUser(user_id)
  if (!user) return

  const text = `Boli ste pozvaný na poradu <a href="${process.env.NEXT_PUBLIC_URL}/meetings/${meeting.id}"><b>${meeting.name}</b></a> ktorá sa uskutoční ${formatDateTime(meeting.date)}`
  console.log("Sending email to ", user?.email);


  const email = await sendEmail({
    from: 'system@taskmanager.sk',
    to: user?.email,
    subject: `Pozvánka na poradu - ${meeting.name}`,
    html: text
  })
}