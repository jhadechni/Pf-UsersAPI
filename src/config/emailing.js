const controller = {}
var nodemailer = require('nodemailer');
const fs = require("fs").promises;

controller.sendWelcomeMessage = async (to) => {
    let contenidoHtml = await fs.readFile('src/templates/emailTemplate.html', 'utf8')

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_DIRECTION,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let info = await transporter.sendMail({
        from: process.env.EMAIL_DIRECTION, // sender address
        to: to, // list of receivers
        subject: "Bienvenido a eOrip App ✔", // Subject line
        text: "Hello world?", // plain text body
        html: contenidoHtml, // html body
      });
}



module.exports = controller