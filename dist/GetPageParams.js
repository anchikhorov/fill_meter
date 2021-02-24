const sharp = require('sharp');
const fs = require('fs');
const appPath = require('./appPath.json');
const system = require("system-commands");
const gm = require('gm').subClass({ imageMagick: true, appPath: appPath.imageMagick });
const CMYKfill = require('./CMYKfill');


async function GetPageParams(fileName) {

    let pageSize = {};
    let totalPix = 0;
    let totalCoverage = new CMYKfill();



    function pixelCount(arr, totalPix) {
        let histogram = []

        for (const item of arr) {
            histogram.push(item.split(':'))

        }
        histogram.forEach(element => {
            totalPix = totalPix + (parseInt(element[0]));
            let string = element[1].replace('\r', '')
            let index = string.search(/(cmyk\w*)/)
            string = string.substring(index, string.length)
            string = string.replace(/cmyk\w*/, "")
            string = string.replace(/[\(\)]/g, "")
            let arr = string.split(",");

            arr = ({ ...arr })
            let cmyk = { 0: 'cyanFill', 1: 'magentaFill', 2: 'yellowFill', 3: 'blackFill' }

            for (let i = 0; i < Object.keys(cmyk).length; i++) {

                if (parseInt(arr[i]) > 0) {

                    if (parseInt(arr[i]) > 1) {

                        totalCoverage[cmyk[i]] = parseInt(totalCoverage[cmyk[i]]) + (parseInt(arr[i]) * parseInt(element[0]));

                    } else {
                        totalCoverage[cmyk[i]] = parseInt(totalCoverage[cmyk[i]]) + parseInt(arr[i]);
                    }
                }

            }

        });
        //totalCoverage['TotalPix'] = totalPix
        totalCoverage['cyanFill'] = Math.ceil(totalCoverage['cyanFill'] / 2.55 / totalPix)
        totalCoverage['magentaFill'] = Math.ceil(totalCoverage['magentaFill'] / 2.55 / totalPix)
        totalCoverage['yellowFill'] = Math.ceil(totalCoverage['yellowFill'] / 2.55 / totalPix)
        totalCoverage['blackFill'] = Math.ceil(totalCoverage['blackFill'] / 2.55 / totalPix)
        return totalCoverage;
    }

    function cmd(path) {
        let cmd = [];
        cmd.push(`"${appPath.ImageMagik}${appPath.ImageMagickExec}"`);
        cmd.push('convert');
        cmd.push(`"${path}"`);
        cmd.push('-format');
        cmd.push('%c');
        cmd.push('histogram:info:');
        cmd = cmd.join();
        const regex = new RegExp(',', 'g');
        cmd = cmd.replace(regex, " ");
        return cmd;
    }

    const resizeImage = (image) => {
        let resized = image.replace(".tif", "_resized.tif");
        return new Promise((resolve, reject) => {
            gm(image)
                .filter('Cubic')
                .resize(220, 220, '!')
                .write(resized, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resized);
                    }
                });
        });
    };

    const resize = async (image, debug) => {
        let path = await resizeImage(image);
        return path;
    };

    const getPageSize = (image, totalCoverage) => {
        return new Promise((resolve, reject) => {
            gm(fileName).identify('%W,%H,%x,%y,%t', (err, data) => {
                let dataarr = data.split(',')
                //console.log(dataarr)
                let page = dataarr[4].replace('page_','')
                //console.log(pageNumber)
                let width = Math.round(dataarr[0] / dataarr[2] * 25.4)
                let height = Math.round(dataarr[1] / dataarr[3] * 25.4)
                pageSize = { width, height };
                if (err) {
                    reject(err);
                } else {
                    resolve({ page, pageSize, totalCoverage});
                }
            });

        });
    };



    async function getPageFill(fileName) {

        await resize(fileName).then(async (path) => {
            let command = cmd(path)
            await system(command)
                .then(output => {
                    let arr = output.split("\r\n");
                    pixelCount(arr, totalPix);
                    deleteTifFile(path);
                }).catch(error => {
                    console.error(error);
                });
            return totalCoverage;

        });

        return totalCoverage;

    }

    async function deleteTifFile(resizedtif) {
        try {
            await fs.promises.unlink(resizedtif);
            //console.log(`File ${resizedtif} was deleted.`);
        }
        catch (error) {
            console.error('there was an error:', error.message);
        }
    }

    //console.log("Input file: ", fileName)
    return await getPageFill(fileName)
        .then((result) => getPageSize(fileName, result))//.then((result) => console.log(result))

}
// getPageFill(fileName)
//     .then((result) => getPageSize(fileName, result))
//     .then((result) => console.log(result))
//GetPageParams("C:\\test\\out\\0408496e-b421-4136-91c9-d151f63dcc8d\\page_001.tif").then((result) => console.log(result))

exports.GetPageParams = GetPageParams;
