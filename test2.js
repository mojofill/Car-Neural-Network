const POWER_MAX = 2; // 2^2 - 1 -> 3
const SIG_MAX = 10; // 2^10 - 1

function toBinary(n) {
    let str = Math.abs(n).toString();
    if (str[0] === '0' && str[1] === '.') str = str.slice(1);
    const roundTo = Math.min(2 ** POWER_MAX - 1, str.replace('.', '').length);
    const power = roundTo - (str.indexOf('.') === -1 ? roundTo : str.indexOf('.'));
    if (power < 0) throw new Error(`Number, ${n}, has too many sigfigs to convert`);
    const rounded = Math.round(Math.abs(n) * 10 ** power) / 10 ** power; // round the number to the correct decimal places
    const mantissa = Math.round(rounded * 10 ** power); // get the number without any decimals
    return (
        (Math.sign(n) > 0 ? '0' : '1') +
        padZeros(power.toString(2), POWER_MAX) +
        padZeros(mantissa.toString(2), SIG_MAX)
    );
}

function parseBinary(n) {
    const sign = n[0] === '1' ? -1 : 1;
    const power = parseInt(n.slice(1, POWER_MAX + 1), 2);
    const data = parseInt(n.slice(POWER_MAX + 1), 2);
    return sign * data * 10 ** -power;
}

function padZeros(binary, length) {
    return '0'.repeat(length - binary.length) + binary;
}
let size = 100;
let check = 1;
let c = 0;
for (let j = 0; j < size; j++) {
    let s = '';
    for (let i = 0; i < 13; i++) {
        s += Math.floor(Math.random() * 2);
    }
    const n = parseBinary(s);
    if (Math.abs(n) <= check) {
        c++;
    }
    console.log(n);
}

console.log((100 * c/size) + '% were below ' + check);
