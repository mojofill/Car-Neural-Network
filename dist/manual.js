"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const car_1 = __importDefault(require("./car"));
const path_1 = __importDefault(require("./path"));
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
let car;
const keys = {
    forward: false,
    back: false,
    left: false,
    right: false
};
let path;
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';
let t = 0;
let startTimer = false;
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
const manualControls = () => {
    document.addEventListener('keydown', (e) => {
        if (t === 0)
            startTimer = true;
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                e.preventDefault();
                keys.forward = true;
                break;
            case "KeyS":
            case "ArrowDown":
                e.preventDefault();
                keys.back = true;
                break;
            case "ArrowLeft":
            case "KeyA":
                e.preventDefault();
                keys.left = true;
                break;
            case "ArrowRight":
            case "KeyD":
                e.preventDefault();
                keys.right = true;
                break;
        }
    });
    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                keys.forward = false;
                break;
            case "KeyS":
            case "ArrowDown":
                keys.back = false;
                break;
            case "ArrowLeft":
            case "KeyA":
                keys.left = false;
                break;
            case "ArrowRight":
            case "KeyD":
                keys.right = false;
                break;
        }
    });
};
const processKeys = () => {
    if (keys.forward === keys.back) {
        car.setA(0);
    }
    else if (keys.forward) {
        car.setA(500);
    }
    if (keys.left === keys.right) {
        car.setHeadingA(0);
    }
    else if (keys.left) {
        if (car.headingV > 0)
            car.setHeadingV(0);
        car.setHeadingA(-100);
    }
    else {
        if (car.headingV < 0)
            car.setHeadingV(0);
        car.setHeadingA(100);
    }
};
const init = () => {
    manualControls();
    requestAnimationFrame(loop);
};
const reset = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
const loop = () => {
    reset();
    time.updateTime();
    if (startTimer)
        t += time.deltaTime;
    path.draw(ctx, image);
    car.setDeltaTime(time.deltaTime);
    car.move();
    car.render();
    if (car.collisionDetect()) {
        car.respawn();
        const sigfigs = 3;
        console.log('best time was: ' + (Math.floor(t * 10 ** (sigfigs - 1)) / 10 ** (sigfigs - 1)) + ' s');
        t = 0;
        startTimer = false;
    }
    processKeys();
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
            path.map = mapJson.data;
            path.setBorderPixels();
            car = new car_1.default(ctx, json.spawn, json.direction + Math.PI / 2, path);
            init();
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
