const controller = {}
const fs = require("fs").promises;
const pdf = require('html-pdf-node');

controller.createPDFTIL = async (transactions) =>  {
    try {
    //fs.unlinkSync('src/outputs/salida.pdf')
 
    let contenidoHtml = await fs.readFile('src/templates/templateTIL.html', 'utf8')
    let template = `
            <hr>
            <p style="text-align: left;"><strong>Descripcion:</strong></p>
            <p style="text-align: left;"><strong>DE:</strong> {{prevOwner}}<br /><strong>A:</strong> {{actualOwner}}</p>
            <p style="text-align: left;">{{description}}
            <p style="text-align: left;">Cedula admin: {{adminID}}
            </p>`;
    let contenido = ``
    transactions.forEach((element) => {
        newData = template.replace("{{prevOwner}}", element.prevOwner)
                          .replace("{{actualOwner}}", element.actualOwner)
                          .replace("{{description}}", element.description)
                          .replace("{{adminID}}", element.adminId)
                          .replace("null", "X")
        contenido += newData
    })
    
    contenidoHtml = contenidoHtml.replace("{{descriptionALL}}", contenido)
                                 .replace("{{city}}", transactions[0].city)
                                 .replace("{{enrollmentNumber}}", transactions[0].enrollmentNumber)
                                 .replace("{{status}}", transactions[transactions.length - 1].status)
    console.log(contenidoHtml)
    const file = { content: contenidoHtml };
    const options = { format: 'A4' };
    const pdfBuffer = await pdf.generatePdf(file,options)
    console.log(pdfBuffer)

    return pdfBuffer 
        
    } catch (error) {
        console.log(error)
    }
    
}




module.exports = controller