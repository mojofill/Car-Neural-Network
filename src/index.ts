import Car from "./car";
import Path from './path';

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

const pixelMap = [];
const pixelWidth = 10;

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

let path: Path;

const car = new Car(ctx);

const keys = {
    forward: false,
    back: false,
    left: false,
    right: false
}

const init = () => {
    car.setA(0);
    car.setPose(canvas.width / 2, canvas.height / 2, car.getHeading());

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

    requestAnimationFrame(loop);
}

const processKeys = () => {
    if (keys.forward === keys.back) {
        car.setA(0);
        car.setBrake(false);
    }
    else if (keys.forward) {
        car.setA(500);
    }
    else {
        car.setBrake(true);
    }

    if (keys.left === keys.right) {
        car.setHeadingA(0);
    }

    else if (keys.left) {
        if (car.getHeadingV() > 0) car.setHeadingV(0);
        car.setHeadingA(-100);
    }
    else {
        if (car.getHeadingV() < 0) car.setHeadingV(0);
        car.setHeadingA(100);
    }
}

const reset = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const loop = () => {
    time.updateTime();

    reset();

    path.renderPath(ctx, 50);

    processKeys();

    car.setDeltaTime(time.delatTime);
    
    car.move();
    car.render();

    requestAnimationFrame(loop);
}

window.onload = () => {
    fetch('../data/points.json')   
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        path = new Path(json.points);
        init();
    })
    .catch((err) => {
        console.log(err);
    })
}
