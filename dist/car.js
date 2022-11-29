"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const renderedObj_1 = __importDefault(require("./renderedObj"));
/*
todo:
build a simple control system
*/
const color = "red";
const startingX = 0;
const startingY = 0;
const startingHeading = 0;
const width = 10;
const height = 20;
const maxV = 200;
const maxHeadingV = 3.5;
class Car extends renderedObj_1.default {
    constructor(ctx) {
        super(ctx);
        this.setPose(startingX, startingY, startingHeading);
        this.setDimensions(width, height);
        this.setColor(color);
        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
    }
}
exports.default = Car;
