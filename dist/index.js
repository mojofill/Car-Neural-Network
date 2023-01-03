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
const speed = 1;
const time = {
    curr: Date.now() / 1000,
    past: Date.now() / 1000,
    updateTime() {
        this.past = this.curr;
        this.curr = Date.now() / 1000;
    },
    get deltaTime() {
        return (this.curr - this.past) > 0.03 ? 0 : this.curr - this.past;
    }
};
const bestDistance = {
    x: 0,
    y: 0,
    t: 0
};
const secondBestDistance = {
    x: 0,
    y: 0,
    t: 0
};
let path; // use later for pixel detection stuff
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';
let generation = 0;
let bestAI;
let secondBestAI;
// todo, build a whole lotta cars
let AIs = [];
const AIAmount = 200;
// fuck it bro we just gonna randomly change the best AI's data
let deadAIAmount = 0;
const init = () => {
    loop();
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
    if (bestDistance.x !== 0) {
        ctx.fillStyle = 'green';
        ctx.fillRect(bestDistance.x - 3, bestDistance.y - 3, 6, 6);
        ctx.fillStyle = 'blue';
        ctx.fillRect(secondBestDistance.x - 3, secondBestDistance.y - 3, 6, 6);
    }
    for (let i = 0; i < speed; i++) {
        evaluateAI(i);
        nextGen();
    }
    requestAnimationFrame(loop);
};
const evaluateAI = (i) => {
    for (const ai of AIs) {
        if (ai.car.hidden || ai.car.isHiding)
            continue;
        const car = ai.car;
        car.setDeltaTime(time.deltaTime);
        car.move();
        if (i === 0) {
            if (car.color === 'red') {
                car.render();
            }
            if (car.color === 'green')
                bestAI = ai;
            if (car.color === 'blue')
                secondBestAI = ai;
        }
        const inputLayer = ai.layers[0];
        // first 5 of input
        for (let i = 0; i < car.sensors.length; i++) {
            const sensor = car.sensors[i];
            const { x, y } = sensor.sense();
            // put the distance of each inside the neural network input layer - in this order
            const distance = Math.sqrt((x - car.x) ** 2 + (y - car.y) ** 2);
            const inputLayer = ai.layers[0];
            // ctx.fillStyle = 'green';
            // ctx.fillRect(x-3, y-3, 6, 6);
            inputLayer.set(i, distance);
        }
        // last 3 are acceleration, velocity, turn velocity
        inputLayer.set(car.sensors.length, ai.car.a);
        inputLayer.set(car.sensors.length + 1, ai.car.v);
        inputLayer.set(car.sensors.length + 2, ai.car.headingV);
        const data = ai.evaluate();
        const a = data.get(0).value;
        const heading_v = data.get(1).value;
        ai.translateOutput(a, heading_v);
        // record how far along the cars have gone, the two cars that went the farthest produce the new batch of cars, where the children plus to two cars equal the AIAmount
        if (car.isDead()) {
            // i need a fitness function
            // update distance covered first, then i can get fitness with distance/time
            ai.updateDistanceTraveled();
            deadAIAmount++;
            ai.car.wait();
            ai.car.hide();
        }
        else {
            ai.car.timeAlive += time.deltaTime;
            if (ai.car.timeAlive >= 60) {
                ai.car.die();
            }
        }
    }
    if (secondBestAI !== undefined)
        secondBestAI.car.render();
    if (bestAI !== undefined)
        bestAI.car.render();
};
const nextGen = () => {
    if (deadAIAmount === AIAmount) {
        // pick the two best AI's based on distance traveled
        let bestAICurrGen = AIs[0];
        let farthestDistance = bestAICurrGen.distanceCovered;
        let _i = 0;
        for (let i = 0; i < AIAmount; i++) {
            const ai = AIs[i];
            if (ai.distanceCovered > farthestDistance) {
                bestAICurrGen = ai;
                farthestDistance = ai.distanceCovered;
                _i = i;
            }
        }
        const AICopy = [...AIs];
        AICopy.splice(_i, 1);
        // do the same thing for second best AI
        let secondBestAICurrGen = AICopy[0];
        farthestDistance = secondBestAICurrGen.distanceCovered;
        for (let i = 0; i < AICopy.length; i++) {
            const ai = AICopy[i];
            if (ai.distanceCovered > farthestDistance) {
                secondBestAICurrGen = ai;
                farthestDistance = ai.distanceCovered;
            }
        }
        bestDistance.x = bestAICurrGen.car.x;
        bestDistance.y = bestAICurrGen.car.y;
        bestDistance.t = bestAICurrGen.distanceCovered;
        secondBestDistance.x = secondBestAICurrGen.car.x;
        secondBestDistance.y = secondBestAICurrGen.car.y;
        secondBestDistance.t = secondBestAICurrGen.distanceCovered;
        let fitnessSum = 0;
        // calculate the sum of fitnesses
        for (const ai of AIs) {
            fitnessSum += ai.getFitness();
        }
        let target = Math.random() * fitnessSum;
        let runningSum = 0;
        let selectedParent1;
        for (let i = 0; i < AIs.length; i++) {
            runningSum += AIs[i].getFitness();
            if (runningSum > target) {
                selectedParent1 = AIs[i];
                break;
            }
        }
        if (selectedParent1 === undefined)
            throw new Error();
        // get the second parent
        let fitnessSum2 = 0;
        // calculate the sum of fitnesses
        for (const ai of AIs) {
            if (ai.getFitness() === selectedParent1.getFitness())
                continue;
            fitnessSum2 += ai.getFitness();
        }
        let target2 = Math.random() * fitnessSum2;
        let runningSum2 = 0;
        let selectedParent2;
        for (let i = 0; i < AIs.length; i++) {
            if (AIs[i] === selectedParent1)
                continue;
            runningSum2 += AIs[i].getFitness();
            if (runningSum2 > target2) {
                selectedParent2 = AIs[i];
                break;
            }
        }
        if (selectedParent2 === undefined)
            throw new Error();
        const arr = selectedParent1.produceNChildren(selectedParent2, AIs.length - 2);
        AIs = [];
        AIs.push(bestAICurrGen, secondBestAICurrGen);
        for (const ai of arr) {
            AIs.push(ai);
        }
        for (const ai of AIs) {
            ai.car.respawn();
            ai.distanceCovered = 0;
        }
        bestAI = bestAICurrGen;
        secondBestAI = secondBestAICurrGen;
        bestAI.car.color = 'green';
        secondBestAI.car.color = 'blue';
        deadAIAmount = 0;
        generation++;
        // document.title = 'gen ' + generation;
        console.log('gen ' + generation);
    }
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
                    const ai = new ai_1.default(path, new car_1.default(ctx, json.spawn, json.direction + Math.PI / 2, path), ctx);
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
