const controller = {}
var nodemailer = require('nodemailer');
const fs = require("fs").promises;

controller.sendWelcomeMessage = async (user) => {
    let contenidoHtml = await fs.readFile('src/templates/emailTemplate.html', 'utf8')

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_DIRECTION,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    contenidoHtml.replace('{{name}}', user.name)
    let info = await transporter.sendMail({
        from: process.env.EMAIL_DIRECTION, // sender address
        to: user.email, // list of receivers
        subject: "Bienvenido a eOrip App ✔", // Subject line
        text: "Hello world?", // plain text body
        html: contenidoHtml, // html body
      });
      console.log(info)
}



module.exports = controller