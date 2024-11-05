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
//       user: 'support@flexishop.online',
//       pass: 'MGreenlord3'
//   },
//   secure: true
// })

async function sendEmail(email: any) {
  if(process.env.DISABLE_EMAIL) {
    console.log("Email not send - disabled", email.to)
    return
  }
  return await sgMail.send(email)
}


export async function sendWelcomeEmail(email: string, login: string, password: string) {

  console.log("Sending email to ", email);

  const url = process.env.NEXT_PUBLIC_URL


  await sendEmail({
    from: 'support@flexishop.online',
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

export async function sendAssigneeChangeNotification(user_id: number, taskName: string) {
  
  const user = await getUser(user_id)
  if(!user) return
  const text = `Bola Vám pridelená úloha: ${taskName}`
  console.log("Sending email to ", user?.email);

  const email = await sendEmail({
    from: 'support@flexishop.online',
    to: user?.email,
    subject: `Bola Vám pridelená úloha - ${taskName}`,
    html: text
  })  
}

export async function sendReport(email: string, subject: string, report: string) {
  
  const mail = await sendEmail({
    from: 'support@flexishop.online',
    to: email,
    subject,
    html: report
  })  


}

// Meetings

export async function newMeetingAttendantEmail(user_id: number, meeting: Meeting) {

  const user = await getUser(user_id)
  if(!user) return

  const text = `Boli ste pozvaný na poradu <a href="${process.env.NEXT_PUBLIC_URL}/meetings/${meeting.id}"><b>${meeting.name}</b></a> ktorá sa uskutoční ${formatDateTime(meeting.date)}`
  console.log("Sending email to ", user?.email);

  
  const email = await sendEmail({
    from: 'support@flexishop.online',
    to: user?.email,
    subject: `Pozvánka na poradu - ${meeting.name}`,
    html: text
  })  
}