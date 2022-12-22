"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const car_1 = __importDefault(require("./car"));
const path_1 = __importDefault(require("./path"));
const ai_1 = __importDefault(require("./ai/ai"));
const canvas = document.getElementById("canvas");
if (!canvas || !(canvas instanceof HTMLCanvasElement))
    throw new Error("canvas does not exist");
const ctx = canvas.getContext('2d');
if (!ctx || !(ctx instanceof CanvasRenderingContext2D))
    throw new Error('idek how this will ever happen but typescript is stupid sometimes so i gotta do this');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = '' + canvas.width;
canvas.style.height = '' + canvas.height;
canvas.style.position = 'fixed';
canvas.style.margin = canvas.style.left = canvas.style.top = '0px';
const time = {
    curr: Date.now() / 1000,
    past: Date.now() / 1000,
    updateTime() {
        this.past = this.curr;
        this.curr = Date.now() / 1000;
    },
    get deltaTime() {
        return this.curr - this.past;
    }
};
let path; // use later for pixel detection stuff
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';
// todo, build a whole lotta cars
const AIs = [];
const AIAmount = 10;
let ai;
const keys = {
    forward: false,
    back: false,
    left: false,
    right: false
};
const init = () => {
    //manualControls();
    requestAnimationFrame(loop);
};
const reset = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
const loop = () => {
    time.updateTime();
    reset();
    path.draw(ctx, image);
    for (const ai of AIs) {
        const car = ai.car;
        car.setDeltaTime(time.deltaTime);
        car.move();
        car.render();
        for (let i = 0; i < car.sensors.length; i++) {
            const sensor = car.sensors[i];
            const { x, y } = sensor.sense();
            // put the distance of each inside the neural network input layer - in this order
            const distance = Math.sqrt((x - car.x) ** 2 + (y - car.y) ** 2);
            const inputLayer = ai.layers[0];
            inputLayer.set(i, distance);
        }
        const data = ai.evaluate();
        const a = data.get(0).value;
        const heading_v = data.get(1).value;
        ai.translateOutput(a, heading_v);
        if (car.collisionDetect()) {
            // ai has to learn!! backpropagation omg ?!?!
        }
    }
    requestAnimationFrame(loop);
};
window.onload = () => {
    fetch('../data/points.json')
        .then((response) => {
        return response.json();
    })
        .then((json) => {
        path = new path_1.default(json.points, json.spawn, json.direction);
        fetch('../data/map.json')
            .then((response) => {
            return response.json();
        })
            .then((mapJson) => {
            const _init = () => {
                path.setBorderPixels();
                init();
            };
            if (mapJson.data === undefined) {
                path.pixelate(canvas, 1);
                const obj = {
                    "data": path.map
                };
                const string = JSON.stringify(obj);
                navigator.clipboard.writeText(string).then(() => {
                    _init();
                });
            }
            else {
                path.map = mapJson.data;
                for (let i = 0; i < AIAmount; i++) {
                    const ai = new ai_1.default(path, new car_1.default(ctx, json.spawn, json.direction + Math.PI / 2));
                    ai.car.setPath(path);
                    AIs.push(ai);
                }
                _init();
            }
            ;
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
