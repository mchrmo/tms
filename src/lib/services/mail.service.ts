'use server'

// TWILIO BPS68FDK5PQVZ2VLLW6UKQ3C
import Email from "vercel-email";

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const mailService = nodemailer.createTransport({
  host: 'mail.webglobe.sk',
  port: 465,
  auth: {
      user: 'support@flexishop.online',
      pass: 'MGreenlord3'
  },
  secure: true
})


export async function sendWelcomeEmail(email: string, password: string) {

  console.log("Sending email to ", email);
  

  // const mail = await mailService.sendMail({
  //     from: 'support@flexishop.online',
  //     to: email,
  //     replyTo: email,
  //     subject: `Vitajte v systéme TMS mesta Ružomberok`,
  //     html: `
  //       <h2>Pre prihlásenie použite nasledovné údaje: </h2>
  //       <p style="margin: 0">Email: <b>${email}</b> </p>
  //       <p style="margin: 0">Heslo: <b>${password}</b> </p>
  //       <p>Prosím prihláste sa tu: <a href="https://tms-six-ruddy.vercel.app/sign-in">https://tms-six-ruddy.vercel.app</a></p>
  //     `,
  // })  

  const url = process.env.NEXT_PUBLIC_URL


  await sgMail.send({
    from: 'support@flexishop.online',
    to: email,
    subject: `Vitajte v systéme TMS mesta Ružomberok`,
    html: `
      <h2>Pre prihlásenie použite nasledovné údaje: </h2>
      <p style="margin: 0">Email: <b>${email}</b> </p>
      <p style="margin: 0">Heslo: <b>${password}</b> </p>
      <p>Prosím prihláste sa tu: <a href="${url}/sign-in">${url}</a></p>
    `
  })


}