"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./path");
const renderedObj_1 = __importDefault(require("./renderedObj"));
const utils_1 = require("./utils");
/*
todo:
build a simple control system
*/
const color = "red";
const width = 10;
const height = 20;
const maxV = 150;
const maxHeadingV = 8;
class Sensor {
    constructor(car, angle) {
        this.car = car;
        this.angle = angle;
    }
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
            if (y >= this.car.path.map.length || x >= this.car.path.map[0].length || x < 0 || y < 0) {
                this.car.respawn();
                return this.sense();
            }
            if (this.car.path.map[y][x] === path_1.PointType.Border) {
                return {
                    x: x,
                    y: y
                };
            }
        }
    }
}
class Car extends renderedObj_1.default {
    constructor(ctx, spawn, direction, path) {
        super(ctx);
        this.spawn = spawn;
        this.direction = direction;
        this.path = path;
        this.spawnDirection = 0;
        this.sensors = [];
        this.dead = false;
        this.timeAlive = 0;
        this.spawnDirection = direction;
        this.setPose(spawn.x, spawn.y, direction);
        this.setDimensions(width, height);
        this.setColor(color);
        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
        for (let k = -Math.PI / 2; k <= Math.PI / 2; k += Math.PI / 4) {
            this.sensors.push(new Sensor(this, k));
        }
    }
    isDead() {
        return this.collisionDetect() || this.dead;
    }
    die() {
        this.dead = true;
    }
    collisionDetect() {
        if (this.hidden || this.isHiding || this.dead)
            return false;
        // here is to check collisions and stuff
        const points = (0, utils_1.pixelate)(this);
        for (const p of points) {
            if (p.x >= 0 && p.x < this.path.map[0].length && p.y >= 0 && p.y < this.path.map.length) {
                const pixel = this.path.map[p.y][p.x];
                if (pixel === path_1.PointType.Empty || pixel === path_1.PointType.Border) {
                    return true;
                }
            }
        }
        return false;
    }
    respawn() {
        this.isHiding = false;
        this.hidden = false;
        this.x = this.spawn.x;
        this.y = this.spawn.y;
        this.heading = this.spawnDirection;
        this.a = 0;
        this.v = 100;
        this.headingA = 0;
        this.headingV = 0;
        this.dead = false;
        this.timeAlive = 0;
    }
}
exports.default = Car;
