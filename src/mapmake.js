// load JSON version of data onto a page, and direct user to it to copy it

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
canvas.style.height = canvas.height;
canvas.style.width = canvas.width;
canvas.style.position = 'fixed';
canvas.style.margin = 0;
canvas.style.top = 0;
canvas.style.left = 0;

const points = [];
const POINT_COLOR = 'white';
const BACKGROUND_COLOR = 'black';
const FPS = 30;
class Line {
    constructor(p, r) {
        this.p = p;
        this.r = r;
    }
}

function lerp(p, r, t) {
    return {
        x: p.x + t * (r.x - p.x),
        y: p.y + t * (r.y - p.y)
    }
}

function drawP(p) {
    ctx.fillStyle = POINT_COLOR;
    ctx.fillRect(p.x-5, p.y-5, 10, 10);
}

function init() {
    document.addEventListener("mousedown", (e) => {
        const p = {x: e.x, y: e.y};
        drawP(p);
        points.push(p);
        
        draw(points);
    });
    
    document.addEventListener("keyup", (e) => {
        e.preventDefault();
        switch(e.code) {
            case "KeyP":
                draw(points);
                break;
            case "KeyK":
                exportData();
                break;
        }
    });

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw(points) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const p of points) drawP(p);
    ctx.beginPath();
    ctx.strokeStyle = POINT_COLOR;
    for (let t = 0; t <= 1; t += 0.0001) {
        // first test: lerp between all the points in order
        // WRONG - this needs to be recursive
        function recurse(lines, t) {
            // return when there is just one line left
            if (lines.length === 0) return;
            if (lines.length === 1) {
                const {x, y} = lerp(lines[0].p, lines[0].r, t); 
                ctx.lineTo(x, y);
                return;
            }

            // find the lerped point of each line
            const lerpedPoints = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                lerpedPoints.push(lerp(line.p, line.r, t));
            }
            const newLines = [];
            for (let i = 0; i < lerpedPoints.length - 1; i++) {
                newLines.push(new Line(lerpedPoints[i], lerpedPoints[i+1]));
            }

            recurse(newLines, t);
        }

        // create the first set of lines
        const lines = [];
        for (let i = 0; i < points.length - 1; i++) {
            lines.push(new Line(points[i], points[i+1]));
        }

        recurse(lines, t);
    }
    ctx.stroke();
}

function exportData() {
    const data = JSON.stringify(
    {
        "points": points
    }, null, 4);

    const w = window.open("");
    w.document.writeln(`<head><body><p>${data}</p></body></head>`);
}

init();