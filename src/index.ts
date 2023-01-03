import Car from "./car";
import Path from './path';
import AI from "./ai/ai";

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

let speed = 40;

const time = {
    curr: Date.now() / 1000,
    past: Date.now() / 1000,
    updateTime() {
        this.past = this.curr;
        this.curr = Date.now() / 1000;
    },
    get deltaTime() {
        return (this.curr - this.past) > 0.5 ? 0 : this.curr - this.past;
    }
}

const bestDistance = {
    x: 0,
    y: 0
}

const secondBestDistance = {
    x: 0,
    y: 0
}

let path: Path; // use later for pixel detection stuff
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';

let generation = 0;

// todo, build a whole lotta cars
let AIs: Array<AI> = [];
const AIAmount = 50;

// fuck it bro we just gonna randomly change the best AI's data

let deadAIAmount = 0;

const init = () => {
    loop();
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

    if (bestDistance.x !== 0) {
        ctx.fillStyle = 'green';
        ctx.fillRect(bestDistance.x-3, bestDistance.y-3, 6, 6);
        ctx.fillStyle = 'blue';
        ctx.fillRect(secondBestDistance.x-3, secondBestDistance.y-3, 6, 6);
    }
    
    for (let i = 0; i < speed; i++) evaluateAI(i);

    requestAnimationFrame(loop);
}

const evaluateAI = (i: number) => {
    for (const ai of AIs) {
        const car = ai.car;

        car.setDeltaTime(time.deltaTime);
        
        car.move();
        if (i === 0) car.render();

        const inputLayer = ai.layers[0];

        // first 5 of input
        for (let i = 0; i < car.sensors.length; i++) {
            const sensor = car.sensors[i];
            const { x, y } = sensor.sense();
            // put the distance of each inside the neural network input layer - in this order
            const distance = Math.sqrt((x - car.x) ** 2 + (y - car.y) ** 2);
            const inputLayer = ai.layers[0];
            inputLayer.set(i, distance);
        }

        // last 3 are acceleration, velocity, turn velocity
        inputLayer.set(10, ai.car.a);
        inputLayer.set(11, ai.car.v);
        inputLayer.set(12, ai.car.headingV);

        const data = ai.evaluate();
        const a = data.get(0).value;
        const heading_v = data.get(1).value;

        ai.translateOutput(a, heading_v);
        // console.log(a);

        // record how far along the cars have gone, the two cars that went the farthest produce the new batch of cars, where the children plus to two cars equal the AIAmount

        if (car.isDead()) {
            // i need a fitness function
            // update distance covered first, then i can get fitness with distance/time
            ai.updateDistanceTraveled();
            deadAIAmount++;
            
            ai.car.wait();
            ai.car.hide();

            if (deadAIAmount === AIAmount) {
                // pick the two best AI's based on distance traveled
                
                let bestAI = AIs[0];
                let farthestDistance = bestAI.distanceCovered;
                let _i = 0;

                for (let i = 0; i < AIAmount; i++) {
                    const ai = AIs[i];
                    if (ai.distanceCovered > farthestDistance) {
                        bestAI = ai;
                        farthestDistance = ai.distanceCovered;
                        _i = i;
                    }
                }
                
                const AICopy = [...AIs];
                AICopy.splice(_i, 1);
                // do the same thing for second best AI
                let secondBestAI = AICopy[0];
                farthestDistance = secondBestAI.distanceCovered;

                for (let i = 0; i < AICopy.length; i++) {
                    const ai = AICopy[i];
                    if (ai.distanceCovered > farthestDistance) {
                        secondBestAI = ai;
                        farthestDistance = ai.distanceCovered;
                    }
                }

                bestDistance.x = bestAI.car.x;
                bestDistance.y = bestAI.car.y;
                secondBestDistance.x = secondBestAI.car.x;
                secondBestDistance.y = secondBestAI.car.y;

                const arr: Array<AI> = bestAI.produceNChildren(secondBestAI, AIs.length - 2);
                AIs = [];
                AIs.push(bestAI, secondBestAI);

                for (const ai of arr) {
                    AIs.push(ai);
                }

                for (const ai of AIs) {
                    ai.car.respawn();
                    ai.distanceCovered = 0;
                }

                bestAI.car.color = 'green';
                secondBestAI.car.color = 'blue';

                deadAIAmount = 0;
                generation++;
                document.title = 'generation ' + generation;
            }
        }
        else {
            ai.car.timeAlive += time.deltaTime;
            if (ai.car.timeAlive >= 120) {
                ai.car.die();
            }
        }
    }
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
                path.setBorderPixels();
                init();
            }

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
                    const ai = new AI(path, new Car(ctx, json.spawn, json.direction + Math.PI / 2, path), ctx);
                    AIs.push(ai);
                }
                _init();
            };
        })
    })
    .catch((err) => {
        console.log(err);
    })
}
