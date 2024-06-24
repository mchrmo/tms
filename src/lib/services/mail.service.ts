'use server'

const nodemailer = require('nodemailer');

const mailService = nodemailer.createTransport({
  host: 'mail.webglobe.sk',
  port: 465,
  auth: {
      user: 'support@flexishop.online',
      pass: 'MGreenlord3'
  }
})


export async function sendWelcomeEmail(email: string, password: string) {

  const mail = await mailService.sendMail({
      from: 'support@flexishop.online',
      to: email,
      replyTo: email,
      subject: `Vitajte v systéme TMS mesta Ružomberok`,
      html: `
        <h2>Pre prihlásenie použite nasledovné údaje: </h2>
        <p style="margin: 0">Email: <b>${email}</b> </p>
        <p>Heslo: <b>${password}</b> </p>
      `,
  })  
}