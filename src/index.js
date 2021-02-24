"use strict";

const PDFrasterizer = require("./PDFrasterizer");
//const GetPageParams = require("./GetPageParams")
const pr = new PDFrasterizer();

//const getPageParams = GetPageParams.GetPageParams
pr.setProfile('BW')
pr.ParsePDF4FlipImgs("C:\\Users\\alex\\Desktop\\pdf\\Binder1.pdf","C:\\test\\out", true)



