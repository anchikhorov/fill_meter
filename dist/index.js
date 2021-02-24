"use strict";
const appPath = require("./appPath.json")
const PDFrasterizer = require("./PDFrasterizer");
//const GetPageParams = require("./GetPageParams")
const pr = new PDFrasterizer();

//const getPageParams = GetPageParams.GetPageParams
pr.setProfile('iGen')
//console.log(`${appPath.outputPath}`)
pr.ParsePDF4FlipImgs("C:\\Users\\alex\\Desktop\\pdf\\Binder1.pdf",appPath.outputPath, true)



