export const UNIT_WIDTH = 1;
export const PATH_WIDTH = 50;

export interface Point {
    x: number;
    y: number;
}

export interface Obj {
    x: number;
    y: number;
    width: number;
    height: number;
    heading: number;
}

export class Line {
    constructor(public p: Point, public r: Point) {}
}

export function lerp(p: Point, r: Point, t: number) {
    return {
        x: p.x + t * (r.x - p.x),
        y: p.y + t * (r.y - p.y)
    }
}

export function pixelate(obj: Obj) {
    // first pixelate the rectangle, then highlight the border
    // move tangential along the heading, then move along the two normals to turn the rectangle into a collection of evenly spaced points
    // the "step" variable (the width of the square between points) is probably the UNIT_WIDTH, i can tweak this to get the most data
    // then, round the pixels to pixelate them

    const cx = obj.x;
    const cy = obj.y;

    const points = [];

    const step = 0.01;

    const refAngle = obj.heading - Math.PI / 2;
    for (let t = 0; t <= 1; t += step) {
        // lerp along the tangent
        const p1 = { // the normal to the right
            x: cx + t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p2 = { // the normal to the right
            x: cx + t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        // now do the same thing, but translate down the tangent
        const p3 = { // the normal to the right
            x: cx - t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p4 = { // the normal to the right
            x: cx - t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        // now lerp with the normal of the object, not the tangent
        const p5 = { // the normal to the right
            x: cx + (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p6 = { // the normal to the right
            x: cx + (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        // now do the same thing, but translate down the tangent
        const p7 = { // the normal to the right
            x: cx - (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };

        const p8 = { // the normal to the right
            x: cx - (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };

        points.push(p1, p2, p3, p4, p5, p6, p7, p8);
    }

    for (const p of points) {
        p.x = round(p.x, 1);
        p.y = round(p.y, 1);
    }

    return points;
}

export function round(x: number, multiple: number) {
    if (x / multiple - Math.floor(x / multiple) < 0.5) return Math.floor(x / multiple) * multiple;
    else return Math.ceil(x / multiple) * multiple;
}

// todo: rewrite the pixelation stuff
// probs should make a test html to try this stuff out firstt