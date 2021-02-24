    'use strict'

    const fs = require("fs");
    const path = require("path");
    const uuid = require("uuid");
    const system = require("system-commands");
    const appPath = require("../dist/appPath.json");


    async function Rasterize2CMYK_CMS(inputPdfPath, outputTempFolder, path2outputICC, gs_device){
        let outputTempPath = path.join(outputTempFolder, uuid.v4());

        function cmd(inputPdfPath, outputTempPath, path2outputICC, gs_device) {
            
            let desired_x_dpi = 72;
            let desired_y_dpi = desired_x_dpi;
            let dev = [];
            dev.push(`"${appPath.ghostscript}"`);
            dev.push(`-sDEVICE=${gs_device}`); // "tiff32nc";
            dev.push(`-r${desired_x_dpi}x${desired_y_dpi}`);
            dev.push("-sCompression=lzw");
            dev.push("-dNOPAUSE");
            dev.push("-dNumRenderingThreads=8");
            dev.push("-dGraphicsAlphaBits=4");
            dev.push("-dTextAlphaBits=4");
            dev.push("-dSimulateOverprint=true");
            dev.push("-dDOINTERPOLATE"); // custom parameter
            dev.push("-dOverrideICC=true");
            dev.push("-dDeviceGrayToK=true");
            dev.push("-dBlackPtComp=1");
            dev.push("-dKPreserve=1");                                            
            dev.push("-dRenderIntent=1"); 
            dev.push(`-sDefaultGrayProfile="${__dirname}\\iccprofiles\\default_gray.icc"`);
            dev.push(`-sDefaultRGBProfile="${__dirname}\\iccprofiles\\sRGB.icm"`);
            dev.push(`-sDefaultCMYKProfile="${__dirname}\\iccprofiles\\GRACoL2006_Coated1v2.icc"`);
            dev.push(`-sOutputICCProfile="${path2outputICC.trim()}"`);
            dev.push(`-sOutputFile="${path.join(outputTempPath, "page_%03d.tif")}"`); //"page_%03d.tif" path.parse(inputPdfPath).name + ".tif"
            dev.push("-dBATCH");
            dev.push(`"${inputPdfPath}"`);
            let cmd = dev.join();
            const regex = new RegExp(',', 'g');
            cmd = cmd.replace(regex, " ");
            //console.log(cmd);

            return cmd;
        }
       
        //console.log("outputTempPath", outputTempPath)
        async function createOutputFolder(outputTempPath) {
            try {
                await fs.promises.mkdir(outputTempPath);
                //console.log(`Folder ${outputTempPath} was created.`);
            }
            catch (error) {
                console.error('there was an error:', error.message);
            }
        }

      return await createOutputFolder(outputTempPath)
        .then(async () => {
            let command = cmd(inputPdfPath, outputTempPath, path2outputICC, gs_device)
            await system(command).then(output => {
                //console.log(output);
                
                return outputTempPath;
            }).catch(error => {
                console.error(error);
            })
            return outputTempPath;
        })
        .catch(console.error)//.then((outputTempPath) => console.log(outputTempPath) )
        
        //return outputTempPath;
    }
exports.Rasterize2CMYK_CMS = Rasterize2CMYK_CMS;