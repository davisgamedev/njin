/**
 * converts degrees to radians
 * @param {number} deg - angle in degrees
 * @return {number} angle in radians
 */
export function rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * converts radians to degrees
 * @param {number} rad - angle in radians
 * @return {number} angle in degrees
 */
export function deg(rad) {
    return rad * (180/Math.PI);
}

/**
 * range(5) = random number 0.0-5.0
 * range(2, 7) = random number 2.0-7.0
 * @param {number} a
 * @param {number} b
 * @return {number} result
 */
export function range(a, b=null) {
    if (!!b) return Math.random() * (b-a) + a;
    else return Math.random() * a;
}
