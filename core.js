import { config_init } from "./config.js";
import { RendererAttached, LoadRenderer} from "./renderer/renderer.js";
import { Vector } from "./lib/vector.js";

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

        MouseDown: [],
        MousePressed: [],
        MouseReleased: [],
        MouseUpdate: [],
        MouseDraw: [],
        MouseTime: 0
    };

    let nMouse = {
        v: new Vector(0, 0),
        isDown: false,
    }

    let nScripts = {
        Setup: [],
        Update: [],
        Draw: [],
    };

    let nGameObjects = {};
    let nGameObjectKeys = [];
    let nTargetBounds = { top: 0, left: 0};

    function nInit() {
        config_init(nConfig);
        nConfig = window.njin_config;

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
        nTargetBounds = this.r.vp.getBoundingClientRect();
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
        nControls.MouseDraw.forEach(c => this.invokeMouseDrawScript(c));
        nGameObjectKeys.forEach(k => this.invokeDrawScript(nGameObjects[k].Draw));
        if (Continue) window.requestAnimationFrame(nDraw);
    }

    /**
     * Updates nControls
     * Calls any additional Update scripts
     */
    let nUpdate = () => {
        cft = Date.now();
        dt = (cft - lft)/1000;
        lft = cft;
        tt = getTotalTime();

        // key handling
        for (let i = nControls.ActiveKeys.length - 1; i >= 0; i--) {
            let k = nControls.ActiveKeys[i];
            if (nControls.KeyDown[k]) {
                nControls.KeyDown[k].forEach(c => this.invokeKeyDownScript(k, c));
            }
        }
        if (nMouse.isDown) nControls.MouseDown.forEach(c => this.invokeMouseDownScript(c));
        nControls.MouseUpdate.forEach(c => this.invokeMouseUpdateScript(c));

        // game scripts
        nScripts.Update.forEach(u => this.invokeUpdateScript(u));
        nGameObjectKeys.forEach(k => this.invokeUpdateScript(nGameObjects[k].Update));

        // refresh
        if (Continue) {
            rest = (1000/nConfig.tick) - (Date.now() - cft);
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
        if (!nControls.ActiveKeys.includes(e.key)) {
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
        if (nControls.ActiveKeys.includes(e.key)) {
            nControls.ActiveKeys.splice(nControls.ActiveKeys.indexOf(e.key), 1);
            if (nControls.KeyReleased[e.key]) {
                nControls.KeyReleased[e.key].forEach(c => this.invokeKeyReleasedScript(e.key, c));
            }
        }
    });

    document.addEventListener("mousemove", (e) => {
        nMouse.v.x = e.clientX - nTargetBounds.left; 
        nMouse.v.y = e.clientY - nTargetBounds.top;
    });
    document.addEventListener("mousedown", (e) => {
        if (!nMouse.isDown) {
            nMouse.isDown = true;
            nControls.MouseTime = Date.now();
            nControls.MousePressed.forEach(c => this.invokeMousePressedScript(c));
        }
    });
    document.addEventListener("mouseup", (e) => {
        nMouse.isDown = false;
        nControls.MouseReleased.forEach(c => this.invokeMouseReleasedScript(c));
    });
    
    this.config = cnfg => Object.assign(nConfig, cnfg);

    let getTotalTime = () => Date.now() - st;
    let getKeyTime = (k) => (Date.now() - nControls.KeyTime[k])/1000;
    let getMouseTime = () => nMouse.isDown? (Date.now() - nControls.MouseTime)/1000 : 0;

    this.invokeDrawScript    = d => d(this.r);
    this.invokeUpdateScript  = u => u(dt, tt);
    this.invokeSetupScript   = s => s(this.r);

    this.invokeKeyReleasedScript = (k, c) => c(getKeyTime(k));
    this.invokeKeyPressedScript  = (k, c) => c();
    this.invokeKeyDownScript     = (k, c) => c(dt, tt, getKeyTime(k));

    this.invokeMousePressedScript   = c => c(nMouse.v);
    this.invokeMouseReleasedScript  = c => c(nMouse.v, getMouseTime());
    this.invokeMouseDownScript      = c => c(nMouse.v, dt, tt, getMouseTime());
    this.invokeMouseUpdateScript    = c => c(nMouse.v, nMouse.isDown, dt, tt, getMouseTime());
    this.invokeMouseDrawScript      = c => c(this.r, nMouse.v, nMouse.isDown, getMouseTime());

    // eslint-disable-next-line require-jsdoc
    function SafeRegisterControl(controller, key, fn) {
        if (controller[key]) controller[key].push(fn);
        else controller[key] = [fn];
    };

    function RegisterMouseControl(controller, fn) {
        controller.push(fn);
        return fn;
    }

    let remove  = (arr, el) => { arr.splice(arr.indexOf(el), 1); return el; }
    let insert  = (arr, el) => { return [el].concat(arr); }
    let push    = (arr, el) => { arr.push(el); return el; }

    // Accessible vars
    this.RegKeyDown      = (keycode, fn) => SafeRegisterControl(nControls.KeyDown, keycode, fn);
    this.RegKeyPressed   = (keycode, fn) => SafeRegisterControl(nControls.KeyPressed, keycode, fn);
    this.RegKeyReleased  = (keycode, fn) => SafeRegisterControl(nControls.KeyReleased, keycode, fn);

    // semantic
    this.keyup       = (keycode, fn) => this.RegKeyReleased(keycode, fn);
    this.keydown     = (keycode, fn) => this.RegKeyDown(keycode, fn);
    this.keypressed  = (keycode, fn) => this.RegKeyPressed(keycode, fn);

    this.RegMouseDown       = fn => RegisterMouseControl(nControls.MouseDown, fn);
    this.RegMousePressed    = fn => RegisterMouseControl(nControls.MousePressed, fn);
    this.RegMouseReleased   = fn => RegisterMouseControl(nControls.MouseReleased, fn);
    this.RegMouseUpdate     = fn => RegisterMouseControl(nControls.MouseUpdate, fn);
    this.RegMouseDraw       = fn => RegisterMouseControl(nControls.MouseDraw, fn);

    this.mouseup        = fn => this.RegMouseReleased(fn);
    this.mousedown      = fn => this.RegMouseDown(fn);
    this.mousepressed   = fn => this.RegMousePressed(fn);
    this.mouseupdate    = fn => this.RegMouseUpdate(fn);
    this.mousedraw      = fn => this.RegMouseDraw(fn);

    this.RemoveMouseDown        = fn => remove(nControls.MouseDown, fn);
    this.RemoveMousePressed     = fn => remove(nControls.MousePressed, fn);
    this.RemoveMouseReleased    = fn => remove(nControls.MouseReleased, fn);
    this.RemoveMouseUpdate      = fn => remove(nControls.MouseUpdate, fn);
    this.RemoveMouseDraw        = fn => remove(nControls.MouseDown, fn);

    this.AddSetupScript  = fn => push(nScripts.Setup, fn);
    this.AddUpdateScript = fn => push(nScripts.Update, fn);
    this.AddDrawScript   = fn => push(nScripts.Draw, fn);
    this.RemoveSetupScript   = fn => remove(nScripts.Setup, fn);
    this.RemoveUpdateScript  = fn => remove(nScripts.Update, fn);
    this.RemoveDrawScript    = fn => remove(nScripts.Draw, fn);

    this.draw    = fn => { nScripts.Draw   = insert(nScripts.Draw, fn);   return fn; };
    this.update  = fn => { nScripts.Update = insert(nScripts.Update, fn); return fn; };
    this.setup   = fn => { nScripts.Setup  = insert(nScripts.Setup, fn);  return fn; };

    this.addGameObject = (key, obj) => {nGameObjects[key] = obj; nGameObjectKeys.push(key); };
    this.removeGameObject = (key) => { delete nGameObjects[key]; remove(nGameObjectKeys, key); };
    
    
    function createControls (controls, controller) {
        Object.keys(controls).forEach(
            k => SafeRegisterControl(controller, k, controls[k]));
    }

    this.SetKeyPressed  = (controls) => createControls(controls, nControls.KeyPressed);
    this.SetKeyReleased = (controls) => createControls(controls, nControls.KeyReleased);
    this.SetKeyDown     = (controls) => createControls(controls, nControls.KeyDown);

    this.Start = nInit;
    this.Stop = () => Continue = false;
    this.Resume = nResume;

}());
