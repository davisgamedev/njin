export * from "./supp-rend.js";

export const RENDERER = {
    ctx: null,
    vp: null,

    draw: null,
    close: null,
    clear: null,

    path: null,
    trace: null,

    line: null,
    arc: null,
    quadCurve: null,
    bezCurve: null,

    rec: null,
    ellipse: null,
    circle: null,
    shape: null,

    style: null,

    w: null,
    h: null,

    init: () => console.error("No renderer specified!"),
}

export var RendererAttached = false;

export const RENDERERS = {
    BASIC2D: "renderer_basic2d.js",
}

export function SetRenderer(renderer=RENDERER) {
    renderer.init();
    window.njin.r = Object.assign(window.njin.r||{}, renderer);

    RendererAttached = true;
    return window.njin.r;
}

export function LoadRenderer() {
    let script = document.createElement("script");
    script.src = window.njin_config.path + "renderer/" + RENDERERS[window.njin_config.renderer.type];
    script.type = "module";
    document.head.appendChild(script);
}