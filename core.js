import { config_init } from "./config.js";
import { RendererAttached, LoadRenderer} from "./renderer/renderer.js";

export * from "./lib/index.js";
export * from "./renderer/renderer.js";

export var njin = (new function NJIN() {

    // system vars
    let Continue = true;
    let rest = 0;

    // todo, missed frames threshold
    let updateWarn = false;

    let dt = 0; // delta time
    let cft = 0; // current frame start time
    let lft = Date.now(); // last frame start time
    let st = Date.now();
    let tt = 0;

    this.r = null;
    
    let nConfig = {};

    /*
        * nControls list:
        *   KeyDown: called each update frame a key is down
        *   KeyPressed: called the first instance a key is pressed
        *   KeyRelesed: called whenever a key is lifted
        *   ActiveKeys: all the current down keys
    */
    let nControls = {
        KeyDown: {},
        KeyPressed: {},
        KeyReleased: {},
        KeyTime: {},
        ActiveKeys: [], // array of keys
    };

    let nScripts = {
        Setup: [],
        Update: [],
        Draw: [],
    };

    let nGameObjects = {};
    let nGameObjectKeys = [];

    function nInit() {
        config_init(nConfig);
        nConfig = window.njin_config;
        //window.njin = njin;

        LoadRenderer((r) => {
            this.r = r;
            nSetup();
        });

        window.setTimeout(() => {
            if (!RendererAttached) 
                console.error("Renderer could not be attached!");
        }, nConfig.timeout);
    }

    let nSetup = () => {
        nScripts.Setup.forEach(s => this.invokeSetupScript(s));
        nGameObjectKeys.forEach(k => this.invokeSetupScript(nGameObjects[k].Setup));
        nResume();
    }

    function nResume() {
        Continue = true;
        window.setTimeout(nUpdate, 1);
        window.requestAnimationFrame(nDraw);
    }
    /**
     * Draws the scene
     */
    let nDraw = () => {
        if (this.r == null) error("Njin has no renderer!");
        this.r.clear();
        nScripts.Draw.forEach(d => this.invokeDrawScript(d));
        nGameObjectKeys.forEach(k => this.invokeDrawScript(nGameObjects[k].Draw));
        if (Continue) window.requestAnimationFrame(nDraw);
    }

    /**
     * Updates nControls
     * Calls any additional Update scripts
     */
    function nUpdate() {
        cft = Date.now();
        dt = (cft - lft)/1000;
        lft = cft;
        tt = getTotalTime();

        // key handling
        for (let i = nControls.ActiveKeys.length - 1; i >= 0; i--) {
            let k = nControls.ActiveKeys[i];
            if (nControls.KeyDown[k]) {
                nControls.KeyDown[k].forEach(c => njin.invokeKeyDownScript(k, c));
            }
        }

        // game scripts
        nScripts.Update.forEach(u => njin.invokeUpdateScript(u));
        nGameObjectKeys.forEach(k => njin.invokeUpdateScript(nGameObjects[k].Update));

        // refresh
        if (Continue) {
            rest = (1000/njin_config.tick) - (Date.now() - cft);
            if (rest <= 0) {
                if (!updateWarn) {
                    console.warn(`Updates are behind tick goal by ${Math.abs(rest)} ms! consider optimization measures or reduce tickrate!`);
                    updateWarn = false;
                    setTimeout(10, () => updateWarn = false );
                }
                nUpdate();
            }
            else setTimeout(nUpdate, rest);
        }
    }

    // register key handlers
    /*
        * KeyDown listener:
        *   On each keydown, append to nControls.ActiveKeys
        *   If any listener is attached to KeyPressed for that key
        *       call all controls on that keypressed at active key
    */
    document.addEventListener("keydown", (e) => {
        if (nControls.ActiveKeys.indexOf(e.key) == -1) {
            nControls.ActiveKeys.push(e.key);
            if (nControls.KeyPressed[e.key]) {
                nControls.KeyPressed[e.key].forEach(c => invokeKeyPressedScript(e.key, c));
            }
        }
    });

    /*
        * KeyUp listener:
        *   On each keyup, remove from activekeys (check just to be safe)
        *   If any listener is attached to KeyReleased for that key
        *       call all controls on that keyreleased key
    */
    document.addEventListener("keyup", (e) => {
        if (nControls.ActiveKeys.indexOf(e.key) != -1) {
            nControls.ActiveKeys.splice(nControls.ActiveKeys.indexOf(e.key), 1);
            if (nControls.KeyReleased[e.key]) {
                nControls.KeyReleased[e.key].forEach(c => this.invokeKeyReleasedScript(e.key, c));
            }
        }
    });
    
    let remove = (array, el) => {
        array.splice(array.indexOf(el), 1);
    }
    let insert = (arr, el) =>  {
        return [el].concat(arr);
    }

    let getTotalTime = () => Date.now() - st;
    let getKeyTime = (k) => Date.now() - nControls.KeyTime[k];

    this.invokeDrawScript = d => d(this.r);
    this.invokeUpdateScript = u => u(dt, tt);
    this.invokeSetupScript = s => s(this.r);

    this.invokeKeyReleasedScript = (k, c) => c(getKeyTime(k));
    this.invokeKeyPressedScript = (k, c) => c();
    this.invokeKeyDownScript = (k, c) => c(dt, tt, getKeyTime(k));

    // eslint-disable-next-line require-jsdoc
    function SafeRegisterControl(controller, key, fn) {
        if (controller[key]) controller[key].push(fn);
        else controller[key] = [fn];
    };

    // Accessible vars
    this.RegKeyDown = (keycode, fn) => SafeRegisterControl(nControls.KeyDown, keycode, fn);
    this.RegKeyPressed = (keycode, fn) => SafeRegisterControl(nControls.KeyPressed, keycode, fn);
    this.RegKeyReleased = (keycode, fn) => SafeRegisterControl(nControls.KeyReleased, keycode, fn);

    // semantic
    this.keyup = (keycode, fn) => this.RegKeyReleased(keycode, fn);
    this.keydown = (keycode, fn) => this.RegKeyDown(keycode, fn);
    this.keypressed = (keycode, fn) => this.RegKeyPressed(keycode, fn);

        /*
        "ArrowUp": () => player.a.add(player.d.mult(50*dt, false)),",
        },
    */
    this.CreateControls = (controls) => {
        Object.keys(controls).forEach(
            (keycode) => {
                // this.CreateKeyDown() or this.CreateKeyUp(), etc.
                let mode = controls[keycode].Mode||"KeyDown";
                let createScript = this["Create"+mode];
                createScript(
                    keycode, // keycode
                    controls[keycode].Key||subKey(keycode, mode, "Control"), // key
                    controls[keycode].Fn // function
                );
            }
        );
    };

    function createControls (controls, controller) {
        Object.keys(controls).forEach(
            k => SafeRegisterControl(controller, k, controls[k]));
    }

    // [ "ArrowUp": (dt, tt) => player.a.add(player.d.mult(50*dt, false))]

    this.AddSetupScript = fn => nScripts.Setup.push(fn);
    this.AddUpdateScript = fn => nScripts.Update.push(fn);
    this.AddDrawScript = fn => nScripts.Draw.push(fn);
    this.RemoveSetupScript = fn => remove(nScripts.Setup, fn);
    this.RemoveUpdateScript = fn => remove(nScripts.Update, fn);
    this.RemoveDrawScript = fn => remove(nScripts.Draw, fn);

    this.draw = fn => nScripts.Draw = insert(nScripts.Draw, fn);
    this.update = fn => nScripts.Update = insert(nScripts.Update, fn);
    this.setup = fn => nScripts.Setup = insert(nScripts.Setup, fn);
    
    this.config = cnfg => Object.assign(nConfig, cnfg);

    this.addGameObject = (key, obj) => {nGameObjects[key] = obj; nGameObjectKeys.push(key); };
    this.removeGameObject = (key) => { delete nGameObjects[key]; remove(nGameObjectKeys, key); };
    
    this.setKeyPressed = (controls) => createControls(controls, nControls.KeyPressed);
    this.SetKeyReleased = (controls) => createControls(controls, nControls.KeyReleased);
    this.SetKeyDown = (controls) => createControls(controls, nControls.KeyDown);

    this.Start = nInit;

    this.Stop = () => Continue = false;
    this.Resume = nResume;

}());
