'use strict';	// this is for ES10 aka ES2019

// <script src="es10.js" data-debug></script>
// data-debug enables debugging

// Rules for members in classes:
// Uppercase or CamelCase which starts uppercase return "async function" or "Promise".
// All lowercase returns "this".  Always.
// Starting with $ are getter/setter with just $ is what you expect most (the wrapped object, etc.)
// mixedCaps or functions with _ in the name return anything.
// Starting with _ is private, the _ is skipped for the rules above.

var D = ('debug' in document.currentScript.dataset) ? (...a) => console.log('DEBUG', ...a) : (...a) => void 0;

const AsyncFun = Object.getPrototypeOf(async function(){}).constructor;

function isString(s)	{ return typeof s=='string' || s instanceof String }

function GET(u) { return fetch(u, { cache:'no-cache' }) }
function PUTJSON(u,d) { return fetch(u, { cache:'no-cache', method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }) }
function POSTJSON(u,d) { return fetch(u, { cache:'no-cache', method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }) }

try {
  new WeakRef({});
} catch {
  window.WeakRef = class
    {
    constructor(o) { this._o = o }
    deref() { return this._o }
    }
}

(function(f){f()})(function(){

var E_	= new WeakMap();

window.E = function (e)
{
//  D('E', e);
  if (e instanceof _E || e === void 0) return e;
  if (isString(e)) e = document.getElementById(e);
  if (!e)
    return e;

  var t = E_.get(e);
  if (t) { t = t.deref(); if (t) return t; }

//  D('E',e);
  t	= new _E(e);
  E_.set(e, new WeakRef(t));		// both sides are weak!
  return t;
}
})

// ON-Event class (in the capture phase by default)
// If the handling returns trueish, processing of the event stops.
// this is set to the ON-instance within the function (if not bound)
// calls fn(event, ...a)	for: ON('event').add(fn, ...a).attach(element)
// calls fn(event, elem, ...a)	for: elem = E(e).on(fn, ...a)
// You can also .detach() this easily, no more error prone bookkeeping required
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

// This is an element.
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
  add(...c)		{ if (this.$) for (var a of c) this.$.appendChild(E(a).$); return this }
  attach(p)		{ E(p).add(this); return this }

  clr()			{ const e=this.$; var a; while (a = e.firstChild) a.remove(); return this; }

  Run(fn, ...a)		{ return Promise.resolve((async () => fn.apply(this, a))()) }
  run(...a)		{ this.Run(...a); return this }
  }

