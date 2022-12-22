import Car from "./car";

const canvas = document.getElementById("canvas");

if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("canvas does not exist");

const ctx = canvas.getContext('2d');
if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) throw new Error('idek how this will ever happen but typescript is stupid sometimes so i gotta do this');

const car = new Car(ctx, {x: 0, y: 0}, 0);

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