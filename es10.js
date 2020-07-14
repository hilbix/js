'use strict';	// this is for ES10 aka ES2019

// <script src="es10.js" data-debug></script>
// data-debug enables debugging

// Rules for members in classes (NOT on toplevel functions):
// Uppercase or CamelCase which starts uppercase return "async function" or "Promise".
// All lowercase returns "this".  Always.
// Starting with $ are getter/setter with just $ is what you expect most (the wrapped object, etc.)
// mixedCaps or functions with _ in the name return anything.
// Starting with _ is private, the _ is skipped for the rules above.

// <script src="*.js" data-debug></script>
var DEBUGGING = 'debug' in document.currentScript.dataset;	// you can change this later

const _FPAC = Function.prototype.apply.call;
const _FPCC = Function.prototype.call.call;
const DONOTHING = function(){}					// The "do nothing" function

// sorted ABC, commented names are below
const AsyncFun	= Object.getPrototypeOf(async function(){}).constructor;
const C = (fn,...a) => function (...b) { return fn(...a,...b) }	// Curry (allows to bind this)
const CA = (fn,self,a) => (...b) => _FPCC(fn,self,...a,...b);	// Curry Apply (with self)
const CC = (fn,self,...a) => CA(fn,self,a);			// Curry Call (with self)
//const CT = (fn,...a) => CA(fn,this,a)				// instead use: C(this.fn,a) or CC(fn,this)
const D = (...a) => DEBUGGING ? console.log('DEBUG', ...a) : void 0;
const DD = (...a) => DEBUGGING ? C(D,...a) : DONOTHING		// log = DD('err in xxx'); log('whatever')
//DONOTHING
const DomReady	= new Promise(ok => document.addEventListener('DOMContentLoaded', ok));
//E()
//Get()	fetch via 'GET'
const isString	= s => typeof s=='string' || s instanceof String;
//KO()

// Promise.resolve(1).then(OK).catch(KO).then(...OKO('mypromise'))
function KO(e, ...a) { D('catch', v, ...a); throw e }
function OK(v, ...a) { D('then', v, ...a); return v }
function OKO(...a) { return [ v => OK(v, ...a), e => KO(e, ...a) ] }

// P(fn, args) is short for: new Promise((ok,ko) => { try { ok(fn(args)) } catch (e) { ko(e) })
const P = (fn,...a) => Promise.resolve().then(_ => fn(...a));
const PC = (fn,self,...a) => Promise.resolve().then(_ => _FPAC(fn, self, a));

const raise	= e => { throw e }

// fetch() promises
const Get	= u => fetch(u, { cache:'no-cache' })
const _PPJ	= m => (u,d) => fetch(u, { cache:'no-cache', method:m, headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) })
const PostJSON	= _PPJ('POST')
const PutJSON	= _PPJ('PUT')

const Json	= p => p.then(r => r.status==200 ? r.json() : raise(r.status))
const Text	= p => p.then(r => r.status==200 ? r.text() : raise(r.status))
const GetText	= u => Text(Get(u))
const GetJSON	= u => Json(Get(u))

try {
  new WeakRef({});
} catch {
  // Not a working WeakRef mixin
  // (This cannot be implemented with WeakMap)
  window.WeakRef = class
    {
    constructor(o) { this._o = o }
    deref() { return this._o }
    }
}

const E = (function(){

const weak_refs = new WeakMap();

// Without real WeakMap this is a GC nightmare
// We want E to stay along as long as the referenced object stays
return function (e)
{
//  D('E', e);
  if (e === void 0) return new _E();
  if (e instanceof _E) return e;
  if (isString(e)) e = document.getElementById(e);
  if (!e)
    return e;

  var w = weak_refs.get(e);
  if (w) return t.deref();	// t is WeakRef

//  D('E',e);
  w	= new _E(e);
  E_.set(e, new WeakRef(w));	// both sides are weak!
  return w;
}
})();

// ON-Event class (in the capture phase by default)
// If the handling returns trueish, processing of the event stops.
// `this` is set to the ON-instance within the function (if not bound elsewhere)
// calls fn(event, ...a)	for: ON('event').add(fn, ...a).attach(E(element))
// calls fn(event, elem, ...a)	for: elem = E(element).on(fn, ...a)
// Use this.detach() to remove the error handler again, no error prone bookkeeping required
class ON
  {
  constructor(type, capture=true)
    {
      this._type	= type;
      this._capture	= capture;
      this._el		= [];
      this._fn		= [];
    }

  add(fn, ...a)		{ this._fn.push([fn,a]); return this }
//remove(fn, ...a)	{ this._fn.remove([fn,a]); return this }	does not work this way

  handleEvent(ev)
    {
      this.$ = ev;
      for (var a of this._fn)
        if (a[0].call(this,ev,...a[1]))
          {
            ev.preventDefault()
            return false;
          }
      return true;
    }

  attach(...e)
    {
      for (var o of e)
        {
          var t = E(o).$;
          t.addEventListener(this._type, this, true);
          this._el.push(new WeakRef(t));
        }
      return this;
    }

  detach()
    {
      const l=this._el;
      this._el=[];
      for (var a of l)
        {
          var o=l.deref();
          if (o) o.removeEventListener(this._type, this);
        }
      return this;
    }
  }

// This is an element wrapper (not really like jQuery).
// var input = E().DIV.text('hello world ').INPUT;
class _E
  {
  constructor(e)	{ this._e = e }
  get $()		{ return this._e; }
  get $$()		{ return E(this._e.parentNode); }
  E(e)			{ return this.e(e).$ }

// setting is NOT supported
//set $(e)		{ this._e = e === void 0 ? e : isString(e) ? document.getElementById(e) : e }
//e(e)			{ if (e) this.$ = e; return this }

  get $text()		{ return this.$.innerText }
  set $text(s)		{ return this.$.innerText = s }
  get $value()		{ return this.$.value }
  set $value(v)		{ this.$.value = v }
  get $src()		{ return this.$.src }
  set $src(u)		{ this.$.src = u }
  get $alt()		{ return this.$.alt }
  set $alt(u)		{ this.$.alt = u }

  _ADD(e)		{ e = E(e); this.add(e); return e }
  _MK(e,attr)		{ return this._ADD(document.createElement(e)).attr(attr) }
  TEXT(s)		{ return this._ADD(document.createTextNode(s)) }
  text(s)		{ this.TEXT(s); return this }
  value(s)		{ this.$value = s; return this }
  src(s)		{ this.$src = s; return this }
  alt(s)		{ this.$alt = s; return this }
  get DIV()		{ return this._MK('div') }
  get A()		{ return this._MK('a') }
  get IMG()		{ return this._MK('img') }
  get TR()		{ return this._MK('tr') }
  get BR()		{ return this._MK('br') }
  get TD()		{ return this._MK('td') }
  get TH()		{ return this._MK('th') }
  get SPAN()		{ return this._MK('span') }
  get CHECKBOX()	{ return this._MK('input', {type:'checkbox'}) }
  get INPUT()		{ return this._MK('input', {type:'text'}) }
  get TEXTAREA()	{ return this._MK('textarea') }
  get TABLE()		{ return this._MK('table') }
  get BUTTON()		{ return this._MK('button') }
  get SELECT()		{ return this._MK('select') }
  get OPTION()		{ return this._MK('option') }

  get selectedOptions()	{ return (function *() { for (var a of this.$.selectedOptions) yield E(a) }).call(this) }
  get selectedOption()	{ return E(this.selectedOptions.next().value) }

  selected(state)	{ if (state != void 0) this.$.selected = !!state; return this }

  ON(type, fn, ...a)	{ return new ON(type).add(fn, this, ...a).attach(this) }
  on(...a)		{ this.ON(...a); return this }

  rm()			{ this.remove(); return this }

  target(id)		{ return this.attr({target:(id === void 0 ? '_blank' : id)}) }
  href(link)		{ return this.attr({href:link}) }
  attr(a)		{ if (a) for (var b in a) this.$.setAttribute(b, a[b]); return this }
  style(a)		{ if (a) for (var b in a) this.$.style[b]=a[b]; return this }
  add(...c)		{ if (this.$) for (var a of c) this.$.appendChild(E(a).$); return this }
  attach(p)		{ E(p).add(this); return this }

  clr()			{ const e=this.$; var a; while (a = e.firstChild) a.remove(); return this; }

  Run(fn, ...a)		{ return PC(fn, this, a) }
  run(...a)		{ this.Run(...a); return this }

  Loaded()		{ return this.$.decode() }
  }

function arrayCmpShallow(a,b)
{
  if (!a || !b || a.length != b.length)
    return false;

  for (var i=a.length; --i>=0; )
    if (a[i] !== b[i])
      return false;

  return true;
}

// WTF https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function SHA256hex(message)
{
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

