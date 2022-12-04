import Path, { PointType } from "./path";
import RenderedObject from "./renderedObj";
import { pixelate, UNIT_WIDTH } from './utils';

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

export default class Car extends RenderedObject {
    public path: Path = new Path([]);
    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);

        this.setPose(startingX, startingY, startingHeading);
        this.setDimensions(width, height);
        this.setColor(color);

        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
    }

    public setPath(path: Path) {
        this.path = path;
    }

    public collisionDetect(): void {
        // here is to check collisions and stuff
        const points = pixelate(this);
        let collided = false;
        this.ctx.fillStyle = 'blue';
        for (const p of points) {
            this.ctx.fillRect(p.x, p.y, 1, 1);
        }
        for (const p of points) {
            if (p.x >= 0 && p.x < this.path.map[0].length && p.y >= 0 && p.y < this.path.map.length) {
                if (this.path.map[p.y][p.x] === PointType.Empty) {
                    console.log('hello')
                    this.color = 'green';
                    collided = true;
                    break;
                }
            }
        }

        if (!collided) this.color = 'red';
    }
}