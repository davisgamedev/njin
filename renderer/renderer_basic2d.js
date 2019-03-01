import { SetRenderer, NO_COLOR } from "./renderer.js";

export var RENDERER = {
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
            RENDERER.ctx.fill();
            RENDERER.ctx.stroke();
        }
    },

    /**
     * Closes any current path
     * @param {boolean} doClose - confirms the close call
     * @param {boolean} doDraw - confirms a following draw call
     */
    close: function(doClose=true, doDraw=true) {
        if (doClose) RENDERER.ctx.closePath();
        RENDERER.draw(doDraw);
    },

    /**
     * Clears a section or the whole screen
     * @param {Vector} cStart - Starting coordinate
     * @param {Vector} cSize - Size of clearing rect
     */
    clear: function(cStart=null, cSize=null) {
        RENDERER.ctx.clearRect(
            (!!cStart) ? cStart.x : 0,
            (!!cStart) ? cStart.y : 0,
            (!!cSize) ? cSize.x : RENDERER.vp.width,
            (!!cSize) ? cSize.y : RENDERER.vp.height
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
            RENDERER.ctx.beginPath();
            RENDERER.ctx.moveTo(cStart.x, cStart.y);
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
        RENDERER.path(coords[0], beginPath);
        coords.forEach(
            (coord, index) => {
                if (index !== 0) {
                    RENDERER.ctx.lineTo(coord.x, coord.y);
                }
            }
        );
        RENDERER.close(endPath, draw);
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
        RENDERER.path(cStart, beginPath);
        RENDERER.ctx.lineTo(cEnd.x, cEnd.y);
        RENDERER.draw(draw);
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
        if (beginPath) RENDERER.ctx.beginPath();
        RENDERER.ctx.arc(cCenter.x, cCenter.y, rad, start, end, counterClockwise);
        RENDERER.draw(draw);
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
        RENDERER.path(cStart, beginPath);
        RENDERER.ctx.quadraticCurveTo(cControl.x, cControl.y, cEnd.x, cEnd.y);
        RENDERER.draw(draw);
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
        RENDERER.path(cStart, beginPath);
        RENDERER.ctx.bezierCurveTo(
            cControl1.x,
            cControl1.y,
            cControl2.x,
            cControl2.y,
            cEnd.x,
            cEnd.y);
        RENDERER.draw(draw);
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
        if (beginPath) RENDERER.ctx.beginPath();
        RENDERER.ctx.rect(cPos.x, cPos.y, cSize.x, cSize.y);
        RENDERER.draw(draw);
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
        if (beginPath)RENDERER.ctx.beginPath();
        RENDERER.ctx.ellipse(c.x, c.y, cRad.x, cRad.y, rot, start, end, counterClockwise);
        RENDERER.draw(draw);
    },

    /**
     * draws a circle
     * @param {Vector} c - center of circle
     * @param {number} rad - radius of circle
     */
    circle: function(c, rad) {
        RENDERER.arc(c, rad);
    },

    /**
     * draws a polygon
     * @param {Vector[]} coords - array of verteces
     * @param {boolean} close - close or leave polygon open after last vertex
     */
    shape: function(coords, close=true) {
        RENDERER.path(coords[0]);
        coords.forEach(
            (coord, index) => {
                if (index !== 0) {
                    RENDERER.ctx.lineTo(coord.x, coord.y);
                }
            }
        );
        RENDERER.close(close, true);
    },

    style: function(fill=null, stroke=null, strokeSize=null) {
        RENDERER.ctx.fillStyle = fill||NO_COLOR;
        RENDERER.ctx.strokeStyle = stroke||NO_COLOR;
        RENDERER.ctx.lineWidth = strokeSize||1;
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

        RENDERER.vp = canvas;
        RENDERER.ctx = canvas.getContext("2d");
        RENDERER.w = canvas.width;
        RENDERER.h = canvas.height;
    }
}

SetRenderer(RENDERER);
