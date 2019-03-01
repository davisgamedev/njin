export * from "./supp-rend.js";

export const RENDERER_INTERFACE = {
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

export const RENDERER_TYPE = {
    BASIC2D: "renderer_basic2d.js",
}

let rendererCallback;

// called by loaded renderer to set "r" in njin
export function SetRenderer(renderer=RENDERER_INTERFACE) {
    renderer.init();
    RendererAttached = true;
    rendererCallback(renderer);
}

// called by njin to append correct renderer script
export function LoadRenderer(setRendererCallback) {
    rendererCallback = setRendererCallback;
    let script = document.createElement("script");
    script.src = window.njin_config.path + "renderer/" + RENDERER_TYPE[window.njin_config.renderer.type];
    script.type = "module";
    document.head.appendChild(script);
}