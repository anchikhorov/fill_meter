"use strict";

const RasterizedDocument = require("./RasterizedDocument");
const CMYKfill = require("./CMYKfill");
const fs = require("fs");
const path = require("path");
const imagesToPdf = require("images-to-pdf");
const appPath = require("./appPath.json");
const Rasterize2CMYK_CMS = require("./Rasterize2CMYK_CMS");
const GetPageParams = require("./GetPageParams");
const CreateThumb = require('./CreateThumb');


class PDFrasterizer {
    constructor() {
        this.gs_device = "tiff32nc";
        this.outputICC = "";
    }

    setProfile(engine) {
        switch (engine) {
            case "iGen":
                this.outputICC = path.join(__dirname, 'iccprofiles\\igen150FC_v2_ALL.icc');
                break;
            case "allColor":
                this.outputICC = path.join(__dirname, 'iccprofiles\\C175_200lpi_12_09_2011.icc');
                break;
            case "BW":
                this.outputICC = path.join(__dirname, 'iccprofiles\\gray_to_k.icc');
                break;
            default:
                console.log("There is no such engine in this list.");
                break;
        }
    }
    async ParsePDF4FlipImgs(inputPdfPath, outputTempFolder, isDeleteTiffs) {
        let pageCount;
        const rasterizedDoc = new RasterizedDocument();
        rasterizedDoc.sourceDocName = inputPdfPath;
        const rasterize2CMYK_CMS = Rasterize2CMYK_CMS.Rasterize2CMYK_CMS;
        const getPageParams = GetPageParams.GetPageParams;
        const createThumb = CreateThumb.CreateThumb;

        //---
        
        let watch_gs = process.hrtime();

        rasterize2CMYK_CMS(inputPdfPath, outputTempFolder, this.outputICC, this.gs_device)
            .then((tmp_tif_folder) => {
                rasterizedDoc['gsRipTime'] = process.hrtime(watch_gs)
                let tifs = [];
                tifs = readTifFiles(tmp_tif_folder);
                return tifs;
            })
            .catch(console.error)
            .then(async (tifs) => {
                let tifpromises = tifs.map(async (tif) => await getPageParams(tif));
                let jpegpromises = tifs.map(async (tif) => await createThumb(tif));

                let watch_fill = process.hrtime();
                await Promise.all(tifpromises)
                    .then( async (results) => {
                        rasterizedDoc['pages'] = ({ ...results });
                        rasterizedDoc['fillCalcTime'] = process.hrtime(watch_fill);
                        rasterizedDoc.FillDocParams();
                        
                        if (isDeleteTiffs) {

                            await Promise.all(jpegpromises)
                                .then(async (result) => { await pdfCreate(result, inputPdfPath); return result })
                                .then((jpegs) => deleteFiles(jpegs))
                                .then(() => deleteFiles(tifs))

                        } else {

                            await Promise.all(jpegpromises)
                                .then(async (result) => {await pdfCreate(result, inputPdfPath); return result })
                                .then((jpegs) => deleteFiles(jpegs))

                        }

                        return rasterizedDoc
                    })
                    .then((rasterizedDoc) =>
                        writeJsonFile(`${createJsonPath(tifs, inputPdfPath)}`, JSON.stringify(rasterizedDoc)))
                    // .then(async () => {

                    //     if (isDeleteTiffs) {

                    //         await Promise.all(jpegpromises)
                    //             .then(async (result) => { pdfCreate(result, inputPdfPath); return result })
                    //             .then(async (result) => await deleteFiles(result))
                    //             .then(() => deleteFiles(tifs))

                    //     } else {

                    //         await Promise.all(jpegpromises)
                    //             .then(async (result) => { pdfCreate(result, inputPdfPath); return result })
                    //             .then((result) => deleteFiles(result))

                    //     }

                    // })

            })

        // let watch_gs_Stop = process.hrtime(watch_gs);
        // console.log(watch_gs_Stop);
        //---
        //---


        function createJsonPath(tifs, pdfFile) {
            let dir = path.dirname(String(tifs[0]));
            let jsonName = pdfFile.replace(".pdf", ".json");
            jsonName = path.basename(jsonName);
            let jsonPath = path.join(dir, jsonName);
            
            return jsonPath;
        }

        async function pdfCreate(jpgFiles, pdfFile) {
            let dir = path.dirname(String(jpgFiles[0]))
            let pdfName = pdfFile.replace(".pdf", "_Thumb.pdf")
            pdfName = path.basename(pdfName)
            await imagesToPdf(jpgFiles, path.join(dir, pdfName));
            rasterizedDoc['pdfThumbnailPath'] = path.join(dir, pdfName);
            
        }

        async function readTifFiles(tmp_tif_folder) {
            let tifs = [];
            const files = await fs.promises.readdir(tmp_tif_folder);
            for (const file of files) {
                if (path.parse(file).ext == ".tif") {
                    tifs.push(path.join(tmp_tif_folder, file));
                }
                //console.log(path.join(tmp_tif_folder, file));
            }
            return tifs;
        }

        async function writeJsonFile(path, data) {
            try {
                await fs.promises.writeFile(path, data);
                //console.log(`File ${path} was saved.`);
            }
            catch (error) {
                console.error('there was an error:', error.message);
            }

        }

        async function deleteFiles(files) {
            for (const file of files) {
                try {
                    await fs.promises.unlink(file);
                    //console.log(`File ${file} was deleted.`);
                }
                catch (error) {
                    console.error('there was an error:', error.message);
                }
            }
        }

    }


}
module.exports = PDFrasterizer;
