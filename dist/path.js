"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Path {
    constructor(points) {
        this.points = [];
        this.points = points;
    }
    renderPath(ctx, pathWidth) {
        //for (const p of points) drawP(p);
        ctx.beginPath();
        ctx.strokeStyle = "white";
        for (let t = 0; t <= 1; t += 0.0001) {
            // first test: lerp between all the points in order
            // WRONG - this needs to be recursive
            const recurse = (lines, t) => {
                // return when there is just one line left
                if (lines.length === 0)
                    return;
                if (lines.length === 1) {
                    const { x, y } = (0, utils_1.lerp)(lines[0].p, lines[0].r, t);
                    ctx.lineTo(x, y);
                    return;
                }
                // find the lerped point of each line
                const lerpedPoints = [];
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    lerpedPoints.push((0, utils_1.lerp)(line.p, line.r, t));
                }
                const newLines = [];
                for (let i = 0; i < lerpedPoints.length - 1; i++) {
                    newLines.push(new utils_1.Line(lerpedPoints[i], lerpedPoints[i + 1]));
                }
                recurse(newLines, t);
            };
            // create the first set of lines
            const lines = [];
            for (let i = 0; i < this.points.length - 1; i++) {
                lines.push(new utils_1.Line(this.points[i], this.points[i + 1]));
            }
            recurse(lines, t);
        }
        ctx.lineWidth = pathWidth;
        ctx.stroke();
    }
}
exports.default = Path;