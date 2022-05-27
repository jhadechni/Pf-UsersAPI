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

   contenidoHtml = contenidoHtml.replace("{{name}}", user.name)
                                .replace("{{surname}}", user.surnames)

    let info = await transporter.sendMail({
        from: process.env.EMAIL_DIRECTION,
        to: user.email,
        subject: "Bienvenido a eOrip App ✔", 
        html: contenidoHtml, 
      });
}



module.exports = controller