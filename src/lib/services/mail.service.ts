'use server'

// TWILIO BPS68FDK5PQVZ2VLLW6UKQ3C
import Email from "vercel-email";
import { getUser, getUserByClerkId } from "../db/user.repository";

// const nodemailer = require('nodemailer');
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


export async function sendWelcomeEmail(email: string, login: string, password: string) {

  console.log("Sending email to ", email);

  const url = process.env.NEXT_PUBLIC_URL


  await sgMail.send({
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
  
  const email = await sgMail.send({
    from: 'support@flexishop.online',
    to: user?.email,
    subject: `Nová úloha`,
    html: text
  })  

  console.log("email sent", user.email);
  
}