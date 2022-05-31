const controller = {}
const fs = require("fs").promises;
const pdf = require('html-pdf');
const phantomPath = require('witch')('phantomjs-prebuilt', 'phantomjs');
const userModel = require("../models/userModel");
console.log(phantomPath)
controller.createPDFTIL = async (transactions) => {
    try {
        //fs.unlinkSync('src/outputs/salida.pdf')
        let contenidoHtml = await fs.readFile('src/templates/templateTIL.html', 'utf8')
        let template = `
        <hr />
        <p style="text-align: left"><strong>ANOTACION:</strong>  {{fecha}} Radicación: S/N</p>   <p style="text-align: right"><strong>VALOR ACTO:</strong> {{actValor}} </p>
        <p style="text-align: left">
          <strong>DE:</strong> C.C {{prevOwner}}<br /><strong>A:</strong>
          C.C {{actualOwner}}
        </p>
        <p style="text-align: left">{{description}}</p>
        <p style="text-align: left">Cedula admin: {{adminID}}</p>`;
        let contenido = ``

        await Promise.all(transactions.map(async (element) => {
            if (element.prevOwner != null) {
                console.log(element.prevOwner)
                const user = await userModel.findOne({ walletPublicAddress: element.prevOwner })
                //console.log(user)

                newData = template.replace("{{prevOwner}}", user.cedula)
                    .replace("{{actualOwner}}", element.cedula)
                    .replace("{{description}}", element.description)
                    .replace("{{adminID}}", element.adminId)
                    .replace("{{actValor}}", new Intl.NumberFormat('en-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(element.actValue))
                    .replace("{{fecha}}", new Date(element.timeStamp).toLocaleString())
                contenido += newData
            } else {
                newData = template.replace("{{prevOwner}}", 'X')
                    .replace("{{actualOwner}}", element.cedula)
                    .replace("{{description}}", element.description)
                    .replace("{{adminID}}", element.adminId)
                    .replace("{{actValor}}", new Intl.NumberFormat('en-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(element.actValue))
                    .replace("{{fecha}}", new Date(element.timeStamp).toLocaleString())
                contenido += newData
            }
        }))

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

controller.createPDFPQRSD = async (transaction) => {
    try {
        //fs.unlinkSync('src/outputs/salida.pdf')

        let contenidoHtml = await fs.readFile('src/templates/templatePQRSD.html', 'utf8')
        //console.log(contenidoHtml)
        contenidoHtml = contenidoHtml.replace("{{fecha}}", new Date(transaction.timeStamp).toLocaleString())
            .replace("{{enrollmentNumber}}", transaction.enrollmentNumber)
            .replace("{{status}}", transaction.status)
            .replace("{{ciudad}}", transaction.city)
            .replace("{{owner}}", transaction.cedula)
            .replace("{{description}}", transaction.description)
            .replace("{{adminID}}", transaction.adminId)
            .replace("{{fecha}}", new Date(transaction.timeStamp).toLocaleString())
        const options = { "format": "Letter", };
        const pdfBuffer = await createPDF(contenidoHtml, options)

        return pdfBuffer

    } catch (error) {
        console.log(error)
    }

}

function createPDF(html, options) {
    return new Promise((resolve, reject) => {
        pdf.create(html, { ...options, phantomPath: `${phantomPath}` }).toBuffer(function (err, buffer) {
            if (err) {
                reject(err)
            }
            resolve(buffer);
        });
    }
    )
}




module.exports = controller