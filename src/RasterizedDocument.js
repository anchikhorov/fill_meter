"use strict";

const CMYKfill = require("./CMYKfill");
//const page = require("./RasterizedPage")
class RasterizedDocument {
    constructor() {
        this.sourceDocName = "";
        this.pdfThumbnailPath = "";
        this.width = 0.0;
        this.height = 0.0;
        this.documentFill = new CMYKfill();
        this.gsRipTime = 0;
        this.fillCalcTime = 0;
        this.ripAndFillTime = 0;
        this.pages = {};
    }
    RIPandFillTime() {
        this.gsRipTime = parseFloat(this.gsRipTime.join().replace(",", ".")).toFixed(3);
        this.gsRipTime = parseFloat(this.gsRipTime);

        this.fillCalcTime = parseFloat(this.fillCalcTime.join().replace(",", ".")).toFixed(3);
        this.fillCalcTime = parseFloat(this.fillCalcTime);
        //console.log(this.gsRipTime, this.fillCalcTime)
        this.ripAndFillTime = (this.gsRipTime + this.fillCalcTime).toFixed(3);
        this.ripAndFillTime = parseFloat(this.ripAndFillTime);
    }

    FillDocParams() {
        this.RIPandFillTime();
        this.width = this.pages[0]['pageSize']['width']
        this.height = this.pages[0]['pageSize']['height']
        let cyanFillSum = 0;
        let magentaFillSum = 0;
        let yellowFillSum = 0;
        let blackFillSum = 0;
        let pages = 0;
        for (const [key, value] of Object.entries(this.pages)) {
            cyanFillSum = cyanFillSum + parseInt(value['totalCoverage']['cyanFill']);
            magentaFillSum = magentaFillSum + parseInt(value['totalCoverage']['magentaFill']);
            yellowFillSum = yellowFillSum + parseInt(value['totalCoverage']['yellowFill']);
            blackFillSum = blackFillSum + parseInt(value['totalCoverage']['blackFill']);
            pages++
        }

        this.documentFill['cyanFill'] = cyanFillSum / pages
        this.documentFill['magentaFill'] = magentaFillSum / pages
        this.documentFill['yellowFill'] = yellowFillSum / pages
        this.documentFill['blackFill'] = blackFillSum / pages
    }
}
module.exports = RasterizedDocument;
