export const CONFIG_DEFAULTS = {
    tick: 100,
    title: "game",
    timeout: 3000,
    renderer: {
        width: 1024,
        height: 720,
        container_id: "njin-container",
        type: "BASIC2D",
    },
    path: "./njin/",
};

export function config_init(config) {
    window.njin_config = Object.assign({}, CONFIG_DEFAULTS, config);
}