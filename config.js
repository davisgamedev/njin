export const CONFIG_DEFAULTS = {
    tick: 100,
    title: "game",
    container_id: "njin-container",
    timeout: 3000,
    renderer: {
        width: 1024,
        height: 720,
        type: "BASIC2D",
        window: "FULL",
        layers: 1
    },
    path: "./njin/",
};

export function config_init(config) {
    window.njin_config = Object.assign({}, CONFIG_DEFAULTS, config);
}