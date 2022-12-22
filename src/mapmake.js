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

const spawn = {
    x: null,
    y: null
}

const directionPoint = {x: null, y: null};

function drawP(p) {
    ctx.fillStyle = POINT_COLOR;
    ctx.fillRect(p.x-5, p.y-5, 10, 10);
}

function init() {
    document.addEventListener("mousedown", (e) => {
        if (e.shiftKey) {
            if (spawn.x !== null || spawn.y !== null) {
                ctx.clearRect(spawn.x - 5, spawn.y - 5, 10, 10);
            }
            
            spawn.x = e.x;
            spawn.y = e.y;
            ctx.fillStyle = 'red';
            ctx.fillRect(spawn.x - 5, spawn.y - 5, 10, 10);

            draw(points);
            return;
        }

        if (e.button) {
            if (directionPoint.x !== null || directionPoint.y !== null) {
                ctx.clearRect(directionPoint.x - 5, directionPoint.y - 5, 10, 10);
            }
            
            directionPoint.x = e.x;
            directionPoint.y = e.y;
            ctx.fillStyle = 'green';
            ctx.fillRect(directionPoint.x - 5, directionPoint.y - 5, 10, 10);

            draw(points);
            return;
        }

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

    if (spawn.x !== null || spawn.y !== null) {
        ctx.fillStyle = 'red';
        ctx.fillRect(spawn.x - 5, spawn.y - 5, 10, 10);
    }

    if (directionPoint.x !== null || directionPoint.y !== null) {
        ctx.fillStyle = 'green';
        ctx.fillRect(directionPoint.x - 5, directionPoint.y - 5, 10, 10);
    }

    for (const p of points) drawP(p);
    
    if (points.length === 1) return;

    ctx.beginPath();
    ctx.strokeStyle = POINT_COLOR;
    for (let t = 0; t <= 1; t += 0.0001) {
        // first test: lerp between all the points in order
        function recurse(lines, t) {
            if (lines.length === 1) {
                const {x, y} = lerp(lines[0].p, lines[0].r, t);
                document.title = '2';
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

function renderPath(ctx, pathWidth) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (spawn.x !== null || spawn.y !== null) {
        ctx.fillStyle = 'red';
        ctx.fillRect(spawn.x - 5, spawn.y - 5, 10, 10);
    }

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

function exportData() {
    const data = JSON.stringify(
    {
        "points": points,
        "spawn": spawn,
        "direction": Math.atan2(directionPoint.y - spawn.y, directionPoint.x - spawn.x)
    }, null, 4);

    renderPath(ctx, 50);

    const w = window.open("");
    const image = canvas.toDataURL("image/png");
    w.document.writeln(`
    <head>
        <body>
            <p>${data}</p>
            <img src=${image}></img>
        </body>
    </head>
    `);
}

init();