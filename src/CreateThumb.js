//const imagesToPdf = require("images-to-pdf");
const sharp = require('sharp');
//const path = require('path')

async function CreateThumb(path){



let jpgfile = path.replace(".tif", ".jpg");



  return await sharp(path)
  .jpeg({ })
  .toFile(path.replace(".tif", ".jpg"))
  .then( info => {    
    //console.log(jpgfile);
    return path.replace(".tif", ".jpg")
    //console.log(info); 
    //pdfCreate(jpgFiles);
   })
   .catch( err => { console.log(err)});  

}

exports.CreateThumb = CreateThumb;