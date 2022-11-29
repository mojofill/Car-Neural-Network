import RenderedObject from "./renderedObj";

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
const maxHeadingV: number = 3.5;

export default class Car extends RenderedObject{
    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);

        this.setPose(startingX, startingY, startingHeading);
        this.setDimensions(width, height);
        this.setColor(color);

        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
    }
}