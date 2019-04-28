// EXPORTED FROM VECTOR.JS
import { Vector } from "./vector.js";

export const COORD_AXIS = ["x", "y", "z"];

export function zero() { return new Vector(0, 0, 0); }
export function forward() { return new Vector(1, 0, 0); }
export function right() { return new Vector(0, 0, 1); }
export function up() { return new Vector(0, 1, 0); }
export function vpCenter(r) { return new Vector(r.w/2, r.h/2, 0); }
export function vpMax(r) { return new Vector(r.w, r.h, 0); }

/**
 * Gets distance between two coordinates
 * @param {Vector} coord1 first coordinate
 * @param {Vector} coord2 second coordinate
 * @return {number} distance
 */
export function distVector(coord1, coord2) {
    return Math.sqrt(
        Math.pow(coord2.x - coord1.x, 2) +
        Math.pow(coord2.y - coord2.y, 2)
    );
}

/**
 * checks distance between an x and y value and a Vectorinate
 * @param {number} x - x value
 * @param {number} y - y value
 * @param {Vector} vect - coordinate
 * @return {number} distance
 */
export function distVectorPoint(x, y, vect) {
    return distVector(new Vector(x, y), vect);
}

/**
 * Checks if two coordinates are within a distance
 * @param {Vector} coord1 first coordinate
 * @param {Vector} coord2 second coordinate
 * @param {number} dist distance
 * @return {boolean} - result
 */
export function isDist(coord1, coord2, dist) {
    return Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2) <= Math.pow(dist, 2);
}

/**
 * Checks if an x and y are within a distance to a coordinate
 * @param {number} x - x value
 * @param {number} y - y value
 * @param {Vectorinate} vect - coordinate
 * @param {number} dist - distance
 * @return {boolean} - result
 */
export function isDistPoint(x, y, vect, dist) {
    return isDist(new Vector(x, y), vect, dist);
}

export function arrayVectorCalculations(vectors, max=true, min=true, mid=true, mean=true) {
    let results = {
        max: max ? vectors[0] : null,
        min: min ? vectors[0] : null,
        mid: mid ? vectors[0] : null,
        mean: mean ? vectors[0] : null,
    };
    for(let i = 1; i < vectors.length; i++) {
        curr = vectors[i];
        if( max ) {
            if (curr.x > results.max.x ) results.max.x = curr.x;
            if (curr.y > results.max.y ) results.max.y = curr.y;
            if (curr.z > results.max.z ) results.max.z = curr.z;
        }
        if( min ) {
            if (curr.x < results.min.x ) results.min.x = curr.x;
            if (curr.y < results.min.y ) results.min.y = curr.y;
            if (curr.z < results.min.z ) results.min.z = curr.z;
        }
        if ( mean ) {
            results.mean.x = compoundMean(results.mean.x, curr.x, i+1);
            results.mean.y = compoundMean(results.mean.y, curr.y, i+1);
            results.mean.z = compoundMean(results.mean.z, curr.z, i+1);
        }
    }
    if ( mid ) {
        results.mid = results.min.lerp(results.max, 0.5, false);
    }
    return results;
}

export function vectorMaxComp(vect) {
    let abs = vect.abs(false);
    if (abs.y > abs.x && abs.y > abs.z) return 'y';
    else if ( abs.z > abs.x ) return 'z';
    else return 'x';
}

export function GetByVectorIndex(vect, obj) {
    return obj[toString(vect.x)][toString(vect.y)][toString(vect.z)];
}

export function SetByVectorIndex(vect, obj, element) {
    obj[toString(vect.x)][toString(vect.y)][toString(vect.z)] = element;
    return obj;
}

/**
 * @param {number} oldMean - mean to update
 * @param {number} value - value to add to mean
 * @param {number} newSampleSize - number of current total samples
 * @return {number} - new mean
 */
export function compoundMean(oldMean, value, newSampleSize) {
    return (oldMean * (newSampleSize-1) + value)/newSampleSize;
}

export function arrayToVector(array) {
    return new Vector(array[0], array[1], array[2]);
}

export function vect(x, y, z) { return new Vector(x, y, z); }
