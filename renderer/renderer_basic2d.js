import { SetRenderer } from "./renderer.js";

let r;
const NO_COLOR = "rgba(0,0,0,0)";

export var RENDERER_BASIC2D = {
    // assigned in init
    ctx: null,
    vp: null,
    w: null,
    h: null,

     // Basics
    /**
     * Helper to call fill and stroke on canvas
     * @param {boolean} doDraw - confirms the draw call
     */
    draw: function(doDraw=true) {
        if (doDraw) {
            r.ctx.fill();
            r.ctx.stroke();
        }
    },

    /**
     * Closes any current path
     * @param {boolean} doClose - confirms the close call
     * @param {boolean} doDraw - confirms a following draw call
     */
    close: function(doClose=true, doDraw=true) {
        if (doClose) r.ctx.closePath();
        r.draw(doDraw);
    },

    /**
     * Clears a section or the whole screen
     * @param {Vector} cStart - Starting coordinate
     * @param {Vector} cSize - Size of clearing rect
     */
    clear: function(cStart=null, cSize=null) {
        r.ctx.clearRect(
            (!!cStart) ? cStart.x : 0,
            (!!cStart) ? cStart.y : 0,
            (!!cSize) ? cSize.x : r.vp.width,
            (!!cSize) ? cSize.y : r.vp.height
        );
    },

    // paths
    /**
     * Starts a path
     * @param {Vector} cStart - starting Vector
     * @param {boolean} doPath - confirms path call
     */
    path: function(cStart, doPath=true) {
        if (doPath) {
            r.ctx.beginPath();
            r.ctx.moveTo(cStart.x, cStart.y);
        }
    },

    /**
     * Traces a path from a list of coordinates
     * @param {Vector[]} coords - Vector array
     * @param {boolean} beginPath - flag for the start or continuation of a path
     * @param {boolean} endPath - end this path when complete
     * @param {boolean} draw - perform a draw call when complete
     */
    trace: function(coords, beginPath=true, endPath=true, draw=true) {
        r.path(coords[0], beginPath);
        coords.forEach(
            (coord, index) => {
                if (index !== 0) {
                    r.ctx.lineTo(coord.x, coord.y);
                }
            }
        );
        r.close(endPath, draw);
    },

    // lines
    /**
     * Draws a line from two coordinates
     * @param {Vector} cStart - starting coordinate
     * @param {Vector} cEnd - ending coordinate
     * @param {boolean} beginPath - is this a new path
     * @param {boolean} draw - perform a draw call when complete
     */
    line: function(cStart, cEnd, beginPath=true, draw=true) {
        r.path(cStart, beginPath);
        r.ctx.lineTo(cEnd.x, cEnd.y);
        r.draw(draw);
    },

    /**
     * Draws an arc
     * @param {Vector} cCenter - center of the arc
     * @param {number} rad - radius
     * @param {number} start - starting angle in radians
     * @param {number} end - ending angle in radians
     * @param {boolean} counterClockwise - draws arc counter clockwise
     * @param {boolean} beginPath - begins a new path for this arc
     * @param {boolean} draw - perform a draw call when complete
     */
    arc: function(cCenter, rad, start=0, end=Math.PI*2,
                    counterClockwise=null, beginPath=true, draw=true) {
        if (beginPath) r.ctx.beginPath();
        r.ctx.arc(cCenter.x, cCenter.y, rad, start, end, counterClockwise);
        r.draw(draw);
    },

    /**
     * Draws a quadratic curve
     * @param {Vector} cStart - startng coordinate
     * @param {Vector} cControl - control point
     * @param {Vector} cEnd - ending coordinate
     * @param {boolean} beginPath - begins a new path for this curve
     * @param {boolean} draw - performs a draw call
     */
    quadCurve: function(cStart, cControl, cEnd, beginPath, draw) {
        r.path(cStart, beginPath);
        r.ctx.quadraticCurveTo(cControl.x, cControl.y, cEnd.x, cEnd.y);
        r.draw(draw);
    },

    /**
     * Draws a Bezier curve
     * @param {Vector} cStart - startng coordinate
     * @param {Vector} cControl1 - control point 1
     * @param {Vector} cControl2 - control point 2
     * @param {Vector} cEnd - ending coordinate
     * @param {boolean} beginPath - begins a new path for this curve
     * @param {boolean} draw - performs a draw call
     */
    bezCurve: function(cStart, cControl1, cControl2, cEnd, beginPath, draw) {
        r.path(cStart, beginPath);
        r.ctx.bezierCurveTo(
            cControl1.x,
            cControl1.y,
            cControl2.x,
            cControl2.y,
            cEnd.x,
            cEnd.y);
        r.draw(draw);
    },

    // shapes
    /**
     * draws a rectangle
     * @param {Vector} cPos - top left corner
     * @param {Vector} cSize - width/height
     * @param {boolean} beginPath - begins a new path for this rect
     * @param {boolean} draw - perform a draw call when complete
     */
    rect: function(cPos, cSize, beginPath=true, draw=true) {
        if (beginPath) r.ctx.beginPath();
        r.ctx.rect(cPos.x, cPos.y, cSize.x, cSize.y);
        r.draw(draw);
    },

    /**
     * draws an ellipse
     * @param {Vector} c - center of ellipse
     * @param {Vector} cRad - radii of ellipse
     * @param {number} rot - rotation of ellipse
     * @param {number} start - starting angle in radians
     * @param {number} end - ending angle in radians
     * @param {boolean} counterClockwise - draws ellipse counter clockwise
     * @param {boolean} beginPath - begins a new path for this arc
     * @param {boolean} draw - perform a draw call when complete
     */
    ellipse: function(c, cRad, rot=0, start=0, end=Math.PI*2,
                        counterClockwise=null, beginPath=true, draw=true) {
        if (beginPath)r.ctx.beginPath();
        r.ctx.ellipse(c.x, c.y, cRad.x, cRad.y, rot, start, end, counterClockwise);
        r.draw(draw);
    },

    /**
     * draws a circle
     * @param {Vector} c - center of circle
     * @param {number} rad - radius of circle
     */
    circle: function(c, rad) {
        r.arc(c, rad);
    },

    /**
     * draws a polygon
     * @param {Vector[]} coords - array of verteces
     * @param {boolean} close - close or leave polygon open after last vertex
     */
    shape: function(coords, close=true) {
        r.path(coords[0]);
        coords.forEach(
            (coord, index) => {
                if (index !== 0) {
                    r.ctx.lineTo(coord.x, coord.y);
                }
            }
        );
        r.close(close, true);
    },

    style: function(fill=null, stroke=null, strokeSize=null) {
        r.ctx.fillStyle = fill||NO_COLOR;
        r.ctx.strokeStyle = stroke||NO_COLOR;
        r.ctx.lineWidth = strokeSize||1;
    },

    init: function() {
        let config = window.njin_config.renderer;
        let container = document.getElementById(config.container_id);
        if (container == null) {
            container = document.createElement("div");
            container.id = config.container_id;
            document.querySelector("body").appendChild(container);
        }

        let canvas = document.createElement("canvas");
        canvas.id = "njin-renderer-canvas";
        canvas.width = config.width;
        canvas.height = config.height;
        container.append(canvas);

        RENDERER_BASIC2D.vp = canvas;
        RENDERER_BASIC2D.ctx = canvas.getContext("2d");
        RENDERER_BASIC2D.w = canvas.width;
        RENDERER_BASIC2D.h = canvas.height;
    }
}

r = SetRenderer(RENDERER_BASIC2D);

console.log(r.ctx);
