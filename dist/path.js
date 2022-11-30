"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointColors = exports.PointType = void 0;
var PointType;
(function (PointType) {
    PointType[PointType["Road"] = 0] = "Road";
    PointType[PointType["Empty"] = 1] = "Empty";
})(PointType = exports.PointType || (exports.PointType = {}));
class PointColors {
}
exports.PointColors = PointColors;
PointColors.road = [255, 255, 255];
PointColors.car = [255, 0, 0];
class Path {
    constructor(points) {
        this.points = [];
        this.map = [];
        this.points = points;
    }
    draw(ctx, image) {
        ctx.drawImage(image, 0, 0);
    }
    arrayEquals(arr1, arr2) {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i])
                return false;
        }
        return true;
    }
    test(canvas, ctx, UNIT_WIDTH) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === PointType.Road) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(x * UNIT_WIDTH, y * UNIT_WIDTH, UNIT_WIDTH, UNIT_WIDTH);
                }
            }
        }
    }
    pixelate(canvas, UNIT_WIDTH) {
        const image = new Image();
        image.src = '../src/pathImage.png';
        const ctx = canvas.getContext('2d');
        if (!ctx || !(ctx instanceof CanvasRenderingContext2D))
            throw new Error();
        for (let y = 0; y < Math.floor(canvas.height / UNIT_WIDTH); y++) {
            this.map.push([]);
            for (let x = 0; x < Math.floor(canvas.width / UNIT_WIDTH); x++) {
                let totalRoadPixels = 0;
                let totalPixels = 0;
                for (let py = y * UNIT_WIDTH; py < y * UNIT_WIDTH + UNIT_WIDTH; py++) {
                    for (let px = x * UNIT_WIDTH; px < x * UNIT_WIDTH + UNIT_WIDTH; px++) {
                        const data = ctx.getImageData(px, py, 1, 1);
                        const r = data.data[0];
                        const g = data.data[1];
                        const b = data.data[2];
                        if (this.arrayEquals([r, g, b], PointColors.road))
                            totalRoadPixels++;
                        totalPixels++;
                    }
                }
                if (totalRoadPixels / totalPixels >= 0.5)
                    this.map[y].push(PointType.Road);
                else
                    this.map[y].push(PointType.Empty);
            }
        }
    }
}
exports.default = Path;
