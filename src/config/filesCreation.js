const controller = {}
const fs = require("fs").promises;
const pdf = require('html-pdf');
const userModel = require("../models/userModel");

controller.createPDFTIL = async (transactions) => {
    try {
        //fs.unlinkSync('src/outputs/salida.pdf')

        let contenidoHtml = await fs.readFile('src/templates/templateTIL.html', 'utf8')
        let template = `
        <hr />
        <p style="text-align: left"><strong>ANOTACION:</strong>  {{fecha}} Radicación: S/N</p>   <p style="text-align: right"><strong>VALOR ACTO:</strong> {{actValor}} </p>
        <p style="text-align: left">
          <strong>DE:</strong> {{prevOwner}}<br /><strong>A:</strong>
          C.C {{actualOwner}}
        </p>
        <p style="text-align: left">{{description}}</p>
        <p style="text-align: left">Cedula admin: {{adminID}}</p>`;
        let contenido = ``
        transactions.forEach((element) => {
            const user = userModel.find({blockchain_PK : element.prevOwner})
            newData = template.replace("{{prevOwner}}", user.cedula)
                .replace("{{actualOwner}}", element.cedula)
                .replace("{{description}}", element.description)
                .replace("{{adminID}}", element.adminId)
                .replace("null", "X")
                .replace("{{actValor}}", new Intl.NumberFormat('en-CO', {style: 'currency',currency: 'COP', minimumFractionDigits: 2}).format(element.actValue))
                .replace("{{fecha}}", new Date(element.timeStamp).toLocaleString())
            contenido += newData
        })

        contenidoHtml = contenidoHtml.replace("{{descriptionALL}}", contenido)
            .replace("{{city}}", transactions[0].city)
            .replace("{{enrollmentNumber}}", transactions[0].enrollmentNumber)
            .replace("{{status}}", transactions[transactions.length - 1].status)

        const options = { "format": "Letter", };
        const pdfBuffer = await createPDF(contenidoHtml, options)

        return pdfBuffer

    } catch (error) {
        console.log(error)
    }

}

function createPDF(html, options) {
    return new Promise((resolve, reject) => {
        pdf.create(html, options).toBuffer(function (err, buffer) {
            if (err) {
                reject(err)
            }
            resolve(buffer);
        });
    }
    )
}




module.exports = controller