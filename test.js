const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = '' + canvas.width;
canvas.style.height = '' + canvas.height;
canvas.style.position = 'fixed';
canvas.style.margin = canvas.style.left = canvas.style.top = '0px';

const map = [];

const FPS = 60;

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Obj {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.heading = 0;
    }

    render() {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.heading);
        ctx.translate(-this.x - this.w / 2, -this.y - this.h / 2);
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

const obj1 = new Obj(0.33 * canvas.width, canvas.height / 2, 100, 100, "white");
const obj2 = new Obj(0.67 * canvas.width, canvas.height / 2, 100, 100, "white");

function pixelate(obj) {
    // first pixelate the rectangle, then highlight the border
    // move tangential along the heading, then move along the two normals to turn the rectangle into a collection of evenly spaced points
    // the "step" variable (the width of the square between points) is probably the UNIT_WIDTH, i can tweak this to get the most data
    // then, round the pixels to pixelate them

    const cx = obj.x + obj.w / 2;
    const cy = obj.y + obj.h / 2;

    const points = [];

    const step = 0.01;

    const refAngle = obj.heading - Math.PI / 2;
    for (let t = 0; t <= 1; t += step) {
        // lerp along the tangent
        const p1 = { // the normal to the right
            x: cx + t * (obj.h / 2) * Math.cos(refAngle) + (obj.w / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + t * (obj.h / 2) * Math.sin(refAngle) + (obj.w / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p2 = { // the normal to the right
            x: cx + t * (obj.h / 2) * Math.cos(refAngle) + (obj.w / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + t * (obj.h / 2) * Math.sin(refAngle) + (obj.w / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        // now do the same thing, but translate down the tangent
        const p3 = { // the normal to the right
            x: cx - t * (obj.h / 2) * Math.cos(refAngle) + (obj.w / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - t * (obj.h / 2) * Math.sin(refAngle) + (obj.w / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p4 = { // the normal to the right
            x: cx - t * (obj.h / 2) * Math.cos(refAngle) + (obj.w / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - t * (obj.h / 2) * Math.sin(refAngle) + (obj.w / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        // now lerp with the normal of the object, not the tangent
        const p5 = { // the normal to the right
            x: cx + (obj.h / 2) * Math.cos(refAngle) + t * (obj.w / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + (obj.h / 2) * Math.sin(refAngle) + t * (obj.w / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p6 = { // the normal to the right
            x: cx + (obj.h / 2) * Math.cos(refAngle) + t * (obj.w / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + (obj.h / 2) * Math.sin(refAngle) + t * (obj.w / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        // now do the same thing, but translate down the tangent
        const p7 = { // the normal to the right
            x: cx - (obj.h / 2) * Math.cos(refAngle) + t * (obj.w / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - (obj.h / 2) * Math.sin(refAngle) + t * (obj.w / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p8 = { // the normal to the right
            x: cx - (obj.h / 2) * Math.cos(refAngle) + t * (obj.w / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - (obj.h / 2) * Math.sin(refAngle) + t * (obj.w / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        points.push(p1, p2, p3, p4, p5, p6, p7, p8);
    }

    const pw = 1;

    ctx.fillStyle = 'white';
    for (const p of points) {
        p.x = round(p.x, pw);
        p.y = round(p.y, pw);
        map[p.y][p.x] = 1;
        ctx.fillRect(p.x, p.y, pw, pw);
    }
}

function round(x, multiple) {
    if (x / multiple - Math.floor(x / multiple) < 0.5) return Math.floor(x / multiple) * multiple;
    else return Math.ceil(x / multiple) * multiple;
}

function init() {
    for (let y = 0; y < canvas.height; y++) {
        map.push([]);
        for (let x = 0; x < canvas.width; x++) {
            map[y].push(0);
        }
    }

    setTimeout(loop, 1000 / FPS);
}

function loop() {
    reset();
    obj1.render();
    pixelate(obj2);
    obj1.heading += 0.025;
    obj2.heading += 0.025;
    setTimeout(loop, 1000 / FPS);
}

init();
