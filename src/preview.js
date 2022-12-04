const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
canvas.style.height = canvas.height;
canvas.style.width = canvas.width;
canvas.style.position = 'fixed';
canvas.style.margin = 0;
canvas.style.top = 0;
canvas.style.left = 0;

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

let points;

function renderPath(ctx, pathWidth) {
    //for (const p of points) drawP(p);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = "white";
    for (let t = 0; t <= 1; t += 0.0001) {
        // first test: lerp between all the points in order
        // WRONG - this needs to be recursive
        const recurse = (lines, t) => {
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
    ctx.lineWidth = pathWidth;
    ctx.stroke();
}

window.onload = () => {
    fetch('../data/points.json')
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        points = json.points;
        renderPath(ctx, 50);
    })
}
