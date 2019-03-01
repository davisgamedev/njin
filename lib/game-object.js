import { DefaultDraw } from "../renderer/renderer.js";
import { Vector, zero, forward } from "./vector.js";

export function GameObject(p=null, sz=null, d, fnSetup=null, fnUpdate=null, fnDraw=null) {
    this.p = p||zero();
    this.v = zero();
    this.a = zero();

    this.d = d||forward();
    this.sz = sz||new Vector(100, 0, 100);

    let doDraw = true;
    let DrawFn = (fnDraw||DefaultDraw).bind(this);
    this.Draw = (...args) => { if(doDraw) DrawFn(...args); }
    this.Hide = () => doDraw = false;
    this.Show = () => doDraw = true;
    this.Showing = () => doDraw;


    let doUpdate = true;
    let UpdateFn = !!fnUpdate? fnUpdate.bind(this) : null;
    this.Update = (...args) => { if(doUpdate && !!UpdateFn) UpdateFn(...args); };
    this.Disable = () => doUpdate = true;
    this.Enable = () => doUpdate = false;
    this.Enabled = () => doUpdate;

    let SetupFn = fnSetup;
    this.Setup = (...args)=>{ if(SetupFn) SetupFn.call(this, ...args); };
}

const GO_PARAMS = ['p','sz','draw','update','setup']

export function gameObject(params) {
    let appendParams = Object.keys(params).filter( k => !GO_PARAMS.includes(k));
    let go = new GameObject(params.p, params.sz, null, params.setup, params.update, params.draw);
    appendParams.forEach(p => go[p] = params[p]);
    return go;
}