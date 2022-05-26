const controller = {}
var pdf = require('html-pdf');
const fs = require("fs");
const res = require('express/lib/response');

controller.createPDFTIL = async (transactions) =>  {
    try {
    //fs.unlinkSync('src/outputs/salida.pdf')
 
    let contenidoHtml = fs.readFileSync('src/templates/templateTIL.html', 'utf8')
    let template = `
            <hr>
            <p style="text-align: left;"><strong>Descripcion:</strong></p>
            <p style="text-align: left;"><strong>DE:</strong> {{prevOwner}}<br /><strong>A:</strong> {{actualOwner}}</p>
            <p style="text-align: left;">{{description}}
            <p style="text-align: left;">Cedula admin: {{adminID}}
            </p>`;
    let contenido = ``
    await Promise.all(transactions.map((element) => {
        newData = template.replace("{{prevOwner}}", element.prevOwner)
                          .replace("{{actualOwner}}", element.actualOwner)
                          .replace("{{description}}", element.description)
                          .replace("{{adminID}}", element.adminId)
                          .replace("null", "X")
        contenido += newData
        return contenido
    }))
    
    contenidoHtml = contenidoHtml.replace("{{descriptionALL}}", contenido)
                                 .replace("{{city}}", transactions[0].city)
                                 .replace("{{enrollmentNumber}}", transactions[0].enrollmentNumber)
                                 .replace("{{status}}", transactions[transactions.length - 1].status)
    console.log(contenidoHtml)
    pdf.create(contenidoHtml).toFile('src/outputs/salida.pdf', function (err, result) {
        if (err) {
            console.log(err);
            return err
        } else {
            return result
        }
    });
        
    } catch (error) {
        console.log(error)
    }
    
}




module.exports = controller