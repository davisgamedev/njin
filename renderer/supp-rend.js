import { Vector } from "../lib/vector.js";
// EXPORTED BY ./RENDERER.JS

export const NO_COLOR = "rgba(0,0,0,0)";

/**
 * @param {number} r - red value
 * @param {number} g - green value (0-255)
 * @param {number} b - blue value (0-255)
 * @param {number} a - alpha value (0-1)
 * @return {string} - color: "rgba(r, g, b, a)"
 */
export function color(r, g, b, a=1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Builds a color string from a color vector
 * @param {Vector} v - color vector
 * @param {number} a - alpha (0-1)
 * @return {string} rgba() color
 */
export function vColor(v, a=1) {
    return rgbaColor(v.x, v.y, v.z, a);
}

export const noColor = "rgba(0,0,0,0)";

/**
 * @return {string} random color
 */
export function randomColor() {
    return rgbaColor(range(255), range(255), range(255));
}

export var center = (r) => new Vector(r.w/2, r.h/2, 0);

export const DefaultDraw = (r) => {
    let pl = this.p.sub(this.sz.div(2));
    let pr = this.p.add(this.sz.div(2));
    r.style("#ff00ff", "#000000", 2);
    r.rect(pl.x, pl.y, this.p.x, this.p.y);
    r.rect(this.p.x, this.p.y, pr.x, pr.y);
    r.style("#000000", "#ffffff", 2);
    r.rect(this.p.x, pl.y, pr.x, this.p.y);
    r.rect(pl.x, this.p.y, this.p.x, pr.y);
}