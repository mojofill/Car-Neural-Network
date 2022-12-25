"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = exports.pixelate = exports.lerp = exports.Line = exports.padZeros = exports.parseBinary = exports.toBinary = exports.replaceAt = exports.PATH_WIDTH = exports.UNIT_WIDTH = void 0;
exports.UNIT_WIDTH = 1;
exports.PATH_WIDTH = 50;
function replaceAt(s, index, replacement) {
    return s.substring(0, index) + replacement + s.substring(index + replacement.length);
}
exports.replaceAt = replaceAt;
// the follow code is courtesy of Jason Yang, 284
const POWER_MAX = 2; // 2^2 - 1 -> 3
const SIG_MAX = 10; // 2^10 - 1
function toBinary(n) {
    let str = Math.abs(n).toString();
    if (str[0] === '0' && str[1] === '.')
        str = str.slice(1);
    const roundTo = Math.min(2 ** POWER_MAX - 1, str.replace('.', '').length);
    const power = roundTo - (str.indexOf('.') === -1 ? roundTo : str.indexOf('.'));
    if (power < 0)
        throw new Error(`Number, ${n}, has too many sigfigs to convert`);
    const rounded = Math.round(Math.abs(n) * 10 ** power) / 10 ** power; // round the number to the correct decimal places
    const mantissa = Math.round(rounded * 10 ** power); // get the number without any decimals
    return ((Math.sign(n) > 0 ? '0' : '1') +
        padZeros(power.toString(2), POWER_MAX) +
        padZeros(mantissa.toString(2), SIG_MAX));
}
exports.toBinary = toBinary;
function parseBinary(n) {
    const sign = n[0] === '1' ? -1 : 1;
    const power = parseInt(n.slice(1, POWER_MAX + 1), 2);
    const data = parseInt(n.slice(POWER_MAX + 1), 2);
    return sign * data * 10 ** -power;
}
exports.parseBinary = parseBinary;
function padZeros(binary, length) {
    return '0'.repeat(length - binary.length) + binary;
}
exports.padZeros = padZeros;
class Line {
    constructor(p, r) {
        this.p = p;
        this.r = r;
    }
}
exports.Line = Line;
function lerp(p, r, t) {
    return {
        x: p.x + t * (r.x - p.x),
        y: p.y + t * (r.y - p.y)
    };
}
exports.lerp = lerp;
function pixelate(obj) {
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
        const p1 = {
            x: cx + t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p2 = {
            x: cx + t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        // now do the same thing, but translate down the tangent
        const p3 = {
            x: cx - t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p4 = {
            x: cx - t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        // now lerp with the normal of the object, not the tangent
        const p5 = {
            x: cx + (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p6 = {
            x: cx + (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        // now do the same thing, but translate down the tangent
        const p7 = {
            x: cx - (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p8 = {
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
exports.pixelate = pixelate;
function round(x, multiple) {
    if (x / multiple - Math.floor(x / multiple) < 0.5)
        return Math.floor(x / multiple) * multiple;
    else
        return Math.ceil(x / multiple) * multiple;
}
exports.round = round;
// todo: rewrite the pixelation stuff
// probs should make a test html to try this stuff out firstt
