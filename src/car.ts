import AI from "./ai/ai";
import Path, { PointType } from "./path";
import RenderedObject from "./renderedObj";
import { pixelate, Point } from './utils';

/*
todo:
build a simple control system
*/

const color = "red";

const startingHeading = 0;

const width = 10;
const height = 20;

const maxV = 200;
const maxHeadingV: number = 3.5;

class Sensor {
    constructor(private car: Car, public angle: number) {}
    /** returns a number that represents distance from closest edge */
    sense() {
        const direction = {
            x: Math.cos(this.car.heading + this.angle - Math.PI / 2),
            y: Math.sin(this.car.heading + this.angle - Math.PI / 2)
        };
        let t = 0;
        // move in direction until first border pixel is met
        while (true) { // dangerous!!!! no cap!!!! i hate while loops!!!
            t += 0.25;
            const x = Math.floor(this.car.x + direction.x * t);
            const y = Math.floor(this.car.y + direction.y * t);
            if (this.car.path.map[y][x] === PointType.Border) {
                return {
                    x: x,
                    y: y
                }
            }
        }
    }
}

export default class Car extends RenderedObject {
    public path: Path = new Path([], {x: 0, y: 0}, 0); // shitty code, but this is the only way
    public spawnDirection: number = 0;
    public sensors: Array<Sensor> = [];

    constructor(ctx: CanvasRenderingContext2D, public spawn: Point, direction: number) {
        super(ctx);
        this.spawnDirection = direction;
        this.setPose(spawn.x, spawn.y, direction);
        this.setDimensions(width, height);
        this.setColor(color);

        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);

        for (let k = -Math.PI / 3; k <= Math.PI / 3; k += Math.PI / 6) {
            this.sensors.push(new Sensor(this, k));
        }
    }

    public setPath(path: Path) {
        this.path = path;
    }

    public collisionDetect(): boolean {
        // here is to check collisions and stuff
        const points = pixelate(this);
        this.ctx.fillStyle = this.color;
        for (const p of points) {
            this.ctx.fillRect(p.x, p.y, 1, 1);
        }
        for (const p of points) {
            if (p.x >= 0 && p.x < this.path.map[0].length && p.y >= 0 && p.y < this.path.map.length) {
                const pixel = this.path.map[p.y][p.x];
                if (pixel === PointType.Empty || pixel === PointType.Border) {
                    // put the player back in the beginning
                    this.x = this.spawn.x;
                    this.y = this.spawn.y;
                    this.heading = this.spawnDirection;
                    this.a = 0;
                    this.v = 0;
                    this.headingA = 0;
                    this.headingV = 0;

                    return true;
                }
            }
        }
        return false;
    }
}