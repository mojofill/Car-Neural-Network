import Car from "./car";
import Path from './path';
import AI from "./ai/ai";
import Layer from "./ai/layer";

const canvas = document.getElementById("canvas");

if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("canvas does not exist");

const ctx = canvas.getContext('2d');

if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) throw new Error('idek how this will ever happen but typescript is stupid sometimes so i gotta do this');

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
    get delatTime() {
        return this.curr - this.past;
    }
}

let path: Path; // use later for pixel detection stuff
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';

let car: Car; // shitty code but this is the only way

let ai: AI;

const keys = {
    forward: false,
    back: false,
    left: false,
    right: false
}

const manualControls = () => {
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
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
        switch(e.code) {
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
}
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
        if (car.headingV > 0) car.setHeadingV(0);
        car.setHeadingA(-100);
    }
    else {
        if (car.headingV < 0) car.setHeadingV(0);
        car.setHeadingA(100);
    }
}

const init = () => {
    //manualControls();
    requestAnimationFrame(loop);
}

const reset = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const loop = () => {
    time.updateTime();

    reset();

    path.draw(ctx, image);

    car.setDeltaTime(time.delatTime);
    
    car.move();
    car.render();

    for (let i = 0; i < car.sensors.length; i++) {
        const sensor = car.sensors[i];
        const { x, y } = sensor.sense();
        ctx.fillStyle = 'green';
        ctx.fillRect(x-5, y-5, 10, 10);
        // put the distance of each inside the neural network input layer - in this order
        const distance = Math.sqrt((x - car.x) ** 2 + (y - car.y) ** 2);
        const inputLayer = ai.layers[0];
        inputLayer.set(i, distance);
    }

    const data = ai.evaluate();
    const a = data.get(0).value;
    const heading_v = data.get(1).value;

    car.setA(a * 100);
    car.setHeadingV(heading_v * 0.01);

    if (car.collisionDetect()) {
        // ai has to learn!! backpropagation omg ?!?!
        ai.learn();
    }

    requestAnimationFrame(loop);
}

window.onload = () => {
    fetch('../data/points.json')   
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        path = new Path(json.points, json.spawn, json.direction);

        fetch('../data/map.json')
        .then((response) => {
            return response.json();
        })
        .then((mapJson) => {
            const _init = () => {
                car.setPath(path);
                path.setBorderPixels();
                ai = new AI(path, car);
                init();
            }

            car = new Car(ctx, json.spawn, json.direction + Math.PI / 2);

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
                _init();
            };
        })
    })
    .catch((err) => {
        console.log(err);
    })
}
