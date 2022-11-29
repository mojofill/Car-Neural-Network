export interface Point {
    x: number;
    y: number
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