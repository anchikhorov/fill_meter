"use strict";

class CMYKfill {
    constructor() {
        this.cyanFill = 0;
        this.magentaFill = 0;
        this.yellowFill = 0;
        this.blackFill = 0;
        
    }
    get CyanFill() {
        return this.cyanFill;
    }
    get MagentaFill() {
        return this.magentaFill;
    }
    get YellowFill() {
        return this.yellowFill;
    }
    get BlackFill() {
        return this.blackFill;
    }
    set cyanfill(value) {
        this.cyanFill = value;
    }
    set magentafill(value) {
        this.magentaFill = value;
    }
    set yellowfill(value) {
        this.yellowFill = value;
    }
    set blackpix(value) {
        this.blackPix = value;
    }
}
module.exports = CMYKfill;
