// test using the monomials and the f_prime function given by bernstein later tmr - check the values

function factorial(n) {
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result
}
function binomialCoefficient(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}
const f = (v, n, t) => binomialCoefficient(n, v) * Math.pow(t, v) * Math.pow(1 - t, n-v); // returns coefficient
const f_prime = (v, n, t) =>
    n * ( f(v - 1, n - 1, t) - f(v, n - 1, t) )

const points = [
    {
        x: 0.333,
        y: 0.75
    },
    {
        x: 0.5,
        y: 0.25
    },
    {
        x: 0.667,
        y: 0.75
    }
];

const n = points.length - 1;

for (let t = 0; t <= 1; t += 0.1) {
    let sum = 0;
    for (let v = 0; v <= n; v++) {
        const coefficient = f(v, n, t);

        sum += coefficient * points[v].x; // take in x
    }

    // the sum is the final x position, because X(t) = c_0* P_0 + c_1 * P_1 + ... + c_n * P_n
}

// find the derivative

// n = 3, 4 iterations

/* given from the video: https://youtu.be/aVwxzDHniEw
P'(t) = P_0(-3t^2+6t-3) + P_1(9t^2-12t+3) + P_2(-9t^2+6t) + P_3(3t^2)
*/

const f_prime_video = (t) => { // testing for just x first
    return (
        points[0].x * (2 * t - 2) +
        points[1].x * (-4 * t + 2) + 
        points[2].x * (2 * t)
    )
}

const f_prime_calculate = (t) => {
    let sum = 0;
    for (let v = 0; v <= n; v++) {
        sum += f_prime(v, n, t) * points[v].x;
    }
    return sum;
}

const sum1 = f_prime_video(0.25);
const sum2 = f_prime_calculate(0.25);

console.log(sum1)
console.log(sum2)
