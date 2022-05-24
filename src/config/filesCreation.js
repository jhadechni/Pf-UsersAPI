const controller = {}
var pdf = require('html-pdf');
const fs = require("fs");

controller.createPDFTIL = (transactions) =>  {
    let contenidoHtml = fs.readFileSync('src/templates/templateTIL.html', 'utf8')
    let template = `
            <hr>
            <p style="text-align: left;"><strong>Descripcion:</strong></p>
            <p style="text-align: left;"><strong>DE:</strong> {{prevOwner}}<br /><strong>A:</strong> {{actualOwner}}</p>
            <p style="text-align: left;">{{description}}
            <p style="text-align: left;">{{adminID}}
            </p>`;
    let contenido = ``
    transactions.map((element) => {
        newData = template.replace("{{prevOwner}}", element.prevOwner)
                          .replace("{{actualOwner}}", element.actualOwner)
                          .replace("{{description}}", element.description)
                          .replace("{{adminID}}", element.adminId)
        contenido += newData
    })
    
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
            //console.log(result);
            //res.send(result);
            //res.download('./salida.pdf')
            console.log(result)
            return result
        }
    });
}




module.exports = controller