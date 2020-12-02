'use strict';	// this is for ES11 aka ES2020
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

// Rules for members in classes (NOT on toplevel functions):
// Uppercase or CamelCase which starts uppercase return "async function" or "Promise".
// All lowercase returns "this".  Always.
// Starting with $ are getter/setter with just $ is what you expect most (the wrapped object, etc.)
// mixedCaps or ALLCAPS or functions with _ in the name or ending on it return anything.
// Starting with _ is private, the first _ is skipped to apply the rules above.

// <script src="es11.js" data-debug></script>
// data-debug enables debugging
var DEBUGGING = document.currentScript?.dataset?.debug;		// you can change this later

const _FPA = Function.prototype.apply;
const _FPC = Function.prototype.call;
const DONOTHING = function(){}					// The "do nothing" DUMMY function
let CONSOLE = function (...a) { console.log(...a) }		// returns void

// sorted ABC, commented names are below
const AsyncFun	= Object.getPrototypeOf(async function(){}).constructor;
const C = (fn,...a) => function (...b) { return fn(...a,...b) }	// Curry (allows to bind this)
const CA = (fn,self,a) => (...b) => _FPC.call(fn,self,...a,...b);	// Curry Apply (with self)
const CC = (fn,self,...a) => CA(fn,self,a);			// Curry Call (with self)
//const CT = (fn,...a) => CA(fn,this,a)				// instead use: C(this.fn,a) or CC(fn,this)
const D = (...a) => DEBUGGING ? CONSOLE('DEBUG', ...a) : void 0;
const DD = (...a) => DEBUGGING ? C(D,...a) : DONOTHING		// log = DD('err in xxx'); log('whatever')
//DONOTHING
const DomReady	= new Promise(ok => document.readyState==='loading' ? document.addEventListener('DOMContentLoaded', ok) : ok);
//E() see below
//Get()	fetch via 'GET'
const isObject	= o => o?.constructor === Object;		// https://stackoverflow.com/posts/comments/52802545
const isString	= s => s?.constructor === String;		// https://stackoverflow.com/a/63945948
const isArray	= a => Array.isArray(a);
const isInt	= i => Number.isInteger(i);
//KO()
const mkArr = x => Array.isArray(x) ? x : [x];
const defArr = (x,d) => { x=mkArr(x); return x.length ? x : mkArr(d) }

// Promise.resolve(1).then(OK).catch(KO).then(...OKO('mypromise'))
function KO(e, ...a)  { D('catch', e, ...a); throw e }	// Promise.reject().catch(KO).then(not_executed)
function OK(v, ...a)  { D('then', v, ...a); return v }
function OKO(...a)    { return [ v => OK(v, ...a), e => KO(e, ...a) ] }
function KOK(...a)    { return DD(...a) }			// Promise.reject().catch(KOK('shown when fail+debug')).then(executed)
function IGN(...a)    { return (...b) => CONSOLE(...a, ...b) }	// Promise.reject().catch(IGN('always log fail')).then(executed)

// P(fn, args) is short for: new Promise((ok,ko) => { try { ok(fn(args)) } catch (e) { ko(e) })
const PR = Promise.resolve();	// PRomise
const PE = Promise.reject();	// PromisErr
PE.catch(DONOTHING);		// shutup "Uncaught in Promise" due to PE
const P = (fn,...a) => PR.then(() => fn(...a));
const PC = (fn,self,...a) => PR.then(() => _FPA.call(fn, self, a));

const fromJ	= o => JSON.parse(o);
const toJ	= o => JSON.stringify(o);
const Sleep	= ms => r => new Promise(ok => setTimeout(ok, ms, r))
const Sleeperr	= ms => r => new Promise((ok,ko) => setTimeout(ko, ms, r))

const THROW	= e => { D('ERROR', e); throw (e instanceof Event ? e : new Error(e)) }

// fetch() promises
const Fetch	= (u, o) => fetch(u,o).then(r => r.ok ? r : Promise.reject(`${r.status}: ${r.url}`))
const Get	= u => Fetch(u, { cache:'no-cache' })
const _MTFUD	= (m,t,f) => (u,d) => Fetch(u, { cache:'no-cache', method:m, headers:{'Content-Type':t}, body:f ? f(d) : d })
const PostText	= _MTFUD('POST', 'text/plain')
const PutText	= _MTFUD('PUT', 'text/plain')
const _MUJ	= m => _MTFUD(m, 'application/json', JSON.stringify)
const PostJSON	= _MUJ('POST')
const PutJSON	= _MUJ('PUT')

const Json	= p => p.then(r => r.status==200 ? r.json() : THROW(r.status))
const Text	= p => p.then(r => r.status==200 ? r.text() : THROW(r.status))
const GetText	= u => Text(Get(u))
const GetJSON	= u => Json(Get(u))

// Escape URI and (only the problematic) HTML entities
// As there are gazillions of named HTML entities (and counting)
// we do NOT want to support them.  Never.  Sorry.
function UE(x) { return encodeURIComponent(x) }	// WTF? I almost broke a finger typing this!
function UD(x) { return decodeURIComponent(x) }	// WTF? BTW: Out of 666 characters long names?
function HE(x) { return String(x).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`) }
function HD(x) { return String(x).replace(/&#(\d)+;/g, (s,c) => String.fromCharChode(c)) }
function HU(x) { return HE(UE(x)) }	// special short form
function JU(x) { return UE(toJ(x)) }	// very special short form

class Cancelled
  {
  constructor(...a) { this._a = a; }
  get cancelled() { return this._a }
  };

// Temporarily cache something expensive (expires at the next loop)
function tmpcache(fn, ...a)
{
  var ret;
  return function ()
    {
      if (ret && this in ret) return ret[this];
      if (!ret)
        {
          ret	= new WeakMap();
          setTimeout(_ => ret = void 0)
        }
      ret[this]	= void 0;	// avoid recursion
      return ret[this] = fn.apply(this, a);
    }
}

// r = single_run(fn, a);
// r(b).then(retval => {}, err => { if (err.cancelled) was_cancelled(err); else other_error(err); })
// - for now single_run() returns just a function to call and not a class
// - r(b) asynchronosuly runs fn(a,b) if fn() not already runs
// - if fn(a,b) still runs, r(x) will invoke fn(a,x) as soon, as fn(a,b) finishes
// - Only the very last call to r(x) is remembered, all intermediate other calls are Cancelled()!
// - r() returns a Promise which resolves to the result (or rejected if Cancelled()/errors)
//   You can check if (e.chancelled) // function was cancelled
const single_run = (fn, ...a) =>
  {
    var invoke, running;

    async function run(...a)
      {
        //D('SR', 'wait', a);
        await void 0;		// run asynchrounously
        //D('SR', 'run', a);
        return fn(...a);	// in case it is a Promise
      };
    async function loop()
      {
        running = invoke;
        invoke = void 0;
        //D('SR', 'loop', running)
        if (running)
          await run(...running[0], ...running[1]).then(running[2], running[3]).finally(loop)
      }
    return (...b) => new Promise((ok, ko) =>
      {
        //D('SR', 'exec', fn, a, invoke);
        if (invoke)
          invoke[3](new Cancelled(a,b));
        invoke = [a,b,ok,ko];
        if (!running)
          loop();
      })
  }

try {
  new WeakRef({});
  var es11WeakRef = WeakRef;
  CONSOLE('es11WeakRef supported');
} catch {
  CONSOLE('es11WeakRefs faked');
  // Not a working WeakRef mixin
  // (This cannot be implemented with WeakMap)
  var es11WeakRef = class
    {
    constructor(o) { this._o = o }
    deref() { return this._o }
    }
}

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

  attach(...a)
    {
      for (const o of a)
        for (const e of o)
          {
            e.addEventListener(this._type, this, true);
            this._el.push(new es11WeakRef(e));
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


// A DOM.styles proxy for class _E below
const Styles = (props =>
  {
    return e => new Proxy(e,
      { get: function (ob, prop, receiver)
        {
          const p = props[prop];
          if (!p) throw new ReferenceError('unknown property '+prop);
          if (isString(p)) prop=p;
          return Reflect.get(ob.$.style, prop, receiver);
        }
      , set: function (ob, prop, val)
        {
          const p = props[prop];
          if (!p) throw new ReferenceError('unknown property '+prop);
          if (isString(p)) prop=p;
          ob.style({[prop]:val});
          return true;
        }
      , defineProperty: _ => false
      , deleteProperty: _ => false
      , has: function (ob, prop) { return !!props[prop] }
      , isExtensible: _ => false
      , preventExtensions: _ => true
      });
  })(
  { // https://www.w3schools.com/jsref/dom_obj_style.asp
    // name:			CSS-Version or replacement string, 666 is draft
    alignContent:		3,
    alignItems:			3,
    alignSelf:			3,
    animation:			3,
    animationDelay:		3,
    animationDirection:		3,
    animationDuration:		3,
    animationFillMode:		3,
    animationIterationCount:	3,
    animationName:		3,
    animationTimingFunction:	3,
    animationPlayState:		3,
    background:			1,
    backgroundAttachment:	1,
    backgroundColor:		1,
    backgroundImage:		1,
    backgroundPosition:		1,
    backgroundRepeat:		1,
    backgroundClip:		3,
    backgroundOrigin:		3,
    backgroundSize:		3,
    backfaceVisibility:		3,
    border:			1,
    borderBottom:		1,
    borderBottomColor:		1,
    borderBottomLeftRadius:	3,
    borderBottomRightRadius:	3,
    borderBottomStyle:		1,
    borderBottomWidth:		1,
    borderCollapse:		2,
    borderColor:		1,
    borderImage:		3,
    borderImageOutset:		3,
    borderImageRepeat:		3,
    borderImageSlice:		3,
    borderImageSource:		3,
    borderImageWidth:		3,
    borderLeft:			1,
    borderLeftColor:		1,
    borderLeftStyle:		1,
    borderLeftWidth:		1,
    borderRadius:		3,
    borderRight:		1,
    borderRightColor:		1,
    borderRightStyle:		1,
    borderRightWidth:		1,
    borderSpacing:		2,
    borderStyle:		1,
    borderTop:			1,
    borderTopColor:		1,
    borderTopLeftRadius:	3,
    borderTopRightRadius:	3,
    borderTopStyle:		1,
    borderTopWidth:		1,
    borderWidth:		1,
    bottom:			2,
    boxDecorationBreak:		3,
    boxShadow:			3,
    boxSizing:			3,
    captionSide:		2,
    caretColor:			3,
    clear:			1,
    clip:			2,
    color:			1,
    columnCount:		3,
    columnFill:			3,
    columnGap:			3,
    columnRule:			3,
    columnRuleColor:		3,
    columnRuleStyle:		3,
    columnRuleWidth:		3,
    columns:			3,
    columnSpan:			3,
    columnWidth:		3,
    content:			2,
    counterIncrement:		2,
    counterReset:		2,
    cursor:			2,
    direction:			2,
    display:			1,
    emptyCells:			2,
    filter:			3,
    flex:			3,
    flexBasis:			3,
    flexDirection:		3,
    flexFlow:			3,
    flexGrow:			3,
    flexShrink:			3,
    flexWrap:			3,
    cssFloat:			1,
    font:			1,
    fontFamily:			1,
    fontSize:			1,
    fontStyle:			1,
    fontVariant:		1,
    fontWeight:			1,
    fontSizeAdjust:		3,
    fontStretch:		3,
    hangingPunctuation:		3,
    height:			1,
    hyphens:			3,
    icon:			3,
    imageOrientation:		3,
    isolation:			3,
    justifyContent:		3,
    left:			2,
    letterSpacing:		1,
    lineHeight:			1,
    listStyle:			1,
    listStyleImage:		1,
    listStylePosition:		1,
    listStyleType:		1,
    margin:			1,
    marginBottom:		1,
    marginLeft:			1,
    marginRight:		1,
    marginTop:			1,
    maxHeight:			2,
    maxWidth:			2,
    minHeight:			2,
    minWidth:			2,
    navDown:			3,
    navIndex:			3,
    navLeft:			3,
    navRight:			3,
    navUp:			3,
    objectFit:			3,
    objectPosition:		3,
    opacity:			3,
    order:			3,
    orphans:			2,
    outline:			2,
    outlineColor:		2,
    outlineOffset:		3,
    outlineStyle:		2,
    outlineWidth:		2,
    overflow:			2,
    overflowX:			3,
    overflowY:			3,
    padding:			1,
    paddingBottom:		1,
    paddingLeft:		1,
    paddingRight:		1,
    paddingTop:			1,
    pageBreakAfter:		2,
    pageBreakBefore:		2,
    pageBreakInside:		2,
    perspective:		3,
    perspectiveOrigin:		3,
    position:			2,
    quotes:			2,
    resize:			3,
    right:			2,
    scrollBehavior:		666,
    tableLayout:		2,
    tabSize:			3,
    textAlign:			1,
    textAlignLast:		3,
    textDecoration:		1,
    textDecorationColor:	3,
    textDecorationLine:		3,
    textDecorationStyle:	3,
    textIndent:			1,
    textJustify:		3,
    textOverflow:		3,
    textShadow:			3,
    textTransform:		1,
    top:			2,
    transform:			3,
    transformOrigin:		3,
    transformStyle:		3,
    transition:			3,
    transitionProperty:		3,
    transitionDuration:		3,
    transitionTimingFunction:	3,
    transitionDelay:		3,
    unicodeBidi:		2,
    userSelect:			2,
    verticalAlign:		1,
    visibility:			2,
    whiteSpace:			1,
    width:			1,
    wordBreak:			3,
    wordSpacing:		1,
    wordWrap:			3,
    widows:			2,
    zIndex:			2,
  });

// This is an element wrapper (not really like jQuery).
// var input = E().DIV.text('hello world ').INPUT;
class _E0
  {
  constructor(e)	{ this._e = (this._E = e ? mkArr(e) : [])[0] }
  get $()		{ return this._e; }

  rm()			{ for (const e of this._E) e.remove(); return this }
  clr()			{ let a; for (const e of this._E) while (a = e.firstChild) a.remove(); return this; }

  *[Symbol.iterator]()	{ for (const e of this._E) yield e }
  *MAP(fn, ...a)	{ const r=[]; for (const e of this._E) yield fn(e, ...a) }

  // E().ALL(selector) queries on the document
  // but: E().clr() does NOT clear the document!
  ALL(sel)
    {
      var ret = [];
      for (const e of defArr(this._E, document))
        e.querySelectorAll(sel).forEach(_ => ret.push(_));
      const r = E(ret);
      D('ALL', sel, r);
      return r;
    }
  }
class _E extends _E0
  {
  constructor(e)	{ super(e); this._cache = {} }

  get $$()		{ return E(this._e?.parentNode); }

  get x()		{ return this._pos().x }
  get y()		{ return this._pos().y }
  get w()		{ return this.$.offsetWidth }
  get h()		{ return this.$.offsetHeight }
  _pos = tmpcache(function ()
    {
      var o = this._e;
      var x = o.offsetLeft;
      var y = o.offsetTop;
      while (o = o.offsetParent)
        {
          x	+= o.offsetLeft;
          y	+= o.offsetTop;
        }
      return { x:x, y:y }
    })

// setting is NOT supported due to caching
//  E(e)			{ return this.e(e).$ }
//  set $(e)		{ this._e = e === void 0 ? e : isString(e) ? document.getElementById(e) : e }
//  e(e)			{ if (e) this.$ = e; return this }

  get $text()		{ return this.$.textContent }		// innerText causes reflow
  set $text(s)		{ return this.$.textContent = s }	// innerText has bad siedeffects on IE<=11
  get $value()		{ return this.$.value }
  set $value(v)		{ this.$.value = v }
  get $src()		{ return this.$.src }
  set $src(u)		{ this.$.src = u }
  get $alt()		{ return this.$.alt }
  set $alt(u)		{ this.$.alt = u }
  get $checked()	{ return this.$.checked }
  set $checked(b)	{ this.$.checked = !!b }
  get $disabled()	{ return this.$.disabled }
  set $disabled(b)	{ this.$.disabled = !!b }
  get $class()		{ return this.$.classList }
  set $class(o)		{ for (const a in o) this.$.classList.toggle(a, o[a]); return this }

  get $style()		{ return this._cache.style ? this._cache.style : this._cache.style = Styles(this) }

  _ADD(e)		{ e = E(e); this.add(e); return e }
  _MK(e,attr)		{ return this._ADD(X(e)).attr(attr) }
  TEXT(...s)		{ return this._ADD(T(...s)) }
  text(...s)
    {
      for (const a of s)
        if (isArray(a))
          this.text(...a)
        else if (a instanceof _E0 || a instanceof Node)
          this._ADD(a);
        else
          this.TEXT(a);
      return this;
    }
  ctext(...s)		{ return this.center().text(...s) }
  ltext(...s)		{ return this.left().text(...s) }
  jtext(...s)		{ return this.justify().text(...s) }
  ntext(...s)		{ return this.nobr().text(...s) }
  ptext(...s)		{ return this.pre().text(...s) }
  rtext(...s)		{ return this.right().text(...s) }
  value(...s)		{ this.$value = s.join(' '); return this }
  src(s)		{ this.$src = s; return this }
  alt(...s)		{ this.$alt = s.join(' '); return this }
  checked(b)		{ this.$checked = b; return this }
  disabled(b)		{ this.$disabled = b; return this }
  align(a)		{ this.$.align = a; return this }
  center()		{ return this.align('center') }
  justify()		{ return this.align('justify') }
  left()		{ return this.align('left') }
  right()		{ return this.align('right') }
  // https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
  // pre:	preserve,preserve,nowrap,preserve
  // nowrap:	collapse,collapse,nowrap,remove
  // I want:	preserve,collapse,nowrap,remove
  // I (nearly always!) need something like pre which is collapsing spaces and tabs!
  // Guess what's missing from the spec!?!
  // So the 2nd next thing is to use 'nowrap', which needs to do line separation myself in case it is multi-line.
  // However this is better than 'pre', which always collapses the spaces myself when single-line.
  ws(x)			{ return this.style({ whiteSpace:x }) }
  nobr()		{ return this.ws('nowrap') }
  pre()			{ return this.ws('pre') }
  get DIV()		{ return this._MK('div') }
  get A()		{ return this._MK('a') }
  get IMG()		{ return this._MK('img') }
  get TR()		{ return this._MK('tr') }
  get BR()		{ return this._MK('br') }
  get TD()		{ return this._MK('td') }
  get TH()		{ return this._MK('th') }
  get THEAD()		{ return this._MK('thead') }
  get TBODY()		{ return this._MK('tbody') }
  get HR()		{ return this._MK('hr') }
  get SPAN()		{ return this._MK('span') }
  get CHECKBOX()	{ return this._MK('input', {type:'checkbox'}) }
  get INPUT()		{ return this._MK('input', {type:'text'}) }
  get TEXTAREA()	{ return this._MK('textarea') }
  get TABLE()		{ return this._MK('table') }
  get BUTTON()		{ return this._MK('button') }
  get SELECT()		{ return this._MK('select') }
  get OPTION()		{ return this._MK('option') }

  th(...a)		{ for (const t of a) this.TH.text(t); return this }
  td(...a)		{ for (const t of a) this.TD.text(t); return this }

  get $options()	{ return (function *() { for (var a of this.$.selectedOptions) yield E(a) }).call(this) }
  get $option()		{ return E(this.$?.selectedOptions[0]) }

  selected(state)	{ if (state != void 0) this.$.selected = !!state; return this }

  updater(fn, ...a)	{ this._upd = [fn,a]; return this }
  UPDATE(...a)		{ return this._upd[0](this, ...this._upd[1], ...a) }
  update(...a)		{ this.UPDATE(...a); return this }
  UPD(...a)		{ return _ => { this.UPDATE(...a, _); return _ } }	// Promise.resolve(1).then(el.UPD()).then(_ => _===1)

  ON(type, fn, ...a)	{ return new ON(type).add(fn, this, ...a).attach(this) }
  on(...a)		{ this.ON(...a); return this }

  target(id)		{ return this.attr({target:(id === void 0 ? '_blank' : id)}) }
  href(link)		{ return this.attr({href:link}) }
  attr(a)		{ if (a) for (const b in a) for (const e of this._E) if (a[b] === void 0) e.removeAttribute(b); else e.setAttribute(b, a[b]); return this }
  style(a)		{ if (a) for (const b in a) for (const e of this._E) e.style[b] = a[b]; return this }
  prepend(...c)		{ if (this.$) for (const a of c) for (const b of E(a)) this.$.prepend(b); return this }
  add(...c)		{ if (this.$) for (const a of c) for (const b of E(a)) this.$.appendChild(b); return this }
  attach(p)		{ E(p).add(this); return this }

  setclass(o)		{ this.$class = o }
  addclass(...c)	{ this.$class.add(...c); return this }
  rmclass(...c)		{ this.$class.remove(...c); return this }
  replaceclass(old,c)	{ this.$class.replace(old,c); return this }
  toggleclass(...c)	{ for (const a in c) this.$class.toggle(a); return this }
  has_class(c)		{ return this.$class.contains(c) }

  Run(fn, ...a)		{ return PC(fn, this, ...a) }
  run(...a)		{ this.Run(...a); return this }

  Loaded()		{ return Promise.all(this.MAP(_ => _.decode())) }
  }

// Create a DOM Element (class _E below).
// To improve usage, this is idempotent, so E(E(x)) === E(x)
// E() creates an undefined element.  This cannot be a parent, but you can call E().DIV
//	Note: You can use E.DIV, too
// E(string) is the same as E(document.getElementById(string))
// E(node) create an element (cached on element)
//	Note: to be able to iterate, textnodes can be wrapped, too
// E(a,b) create a list of elements (not cached) as given
//	Note: all should be Nodes, else strange things might happen.
//	(For performance reason this is not enforced.)
// E([e]) === E(e) and E([a,b]) === E(a,b)
const E = (function(){
  const weak_refs = new WeakMap();

  Object.defineProperty(fn, '_E', { value:[] });

  // This is not perfect, as it copies functions,
  // which do not work.  But we ignore this for now.
  Object.entries(Object.getOwnPropertyDescriptors(_E.prototype)).forEach(_ =>
    {
      const get = _[1].get;
      Object.defineProperty(fn, _[0], get ? { get } : { value:_[1].value });
    });

  return fn;

  // Without real WeakMap this is a GC nightmare
  // We want E to stay along as long as the referenced object stays
  function fn(...e)
    {
      const a = e;
//    D('E', e);
      do
        {
          if (e.length != 1)
            return new _E(e);
          e	= e[0];
        } while (isArray(e));

      if (e instanceof _E0) return e;
      if (isString(e)) e = document.getElementById(e);
      if (!e || !(e instanceof Node))
        {
          console.log('E called with invalid object', a);
          return e;
        }

      var w = weak_refs.get(e);
      if (w) { w = w.deref(); if (w) return w }	// w is WeakRef

//    D('E',e);
      w	= new _E(e);
      weak_refs.set(e, new es11WeakRef(w));	// both sides are weak!
      return w;
    }
})();

// Create a TEXT node
const T = (...s) => E(document.createTextNode(s.join(' ')));

// Create DOM Elements wrapped in class _E
// X('div') creates a DIV (compare E.DIV)
// X('div', 'br', 'span') creates three elements in E(), where .$ is the 'div'
// X(['ul', ['li', 'br', 'span'
const X = (...args) =>
  {
    var has = new Set();
    var x=[];

    function dom(_)
      {
        if (has.has(_))	return;				// avoid infinite recursion
        has.add(_);
//        if (_[0] instanceof Function)
        for (const e of _)
          {
            if (isArray(e))
              dom(e);					// recurse arrays
            else if (e instanceof _E0)
              for (const k in e)
                x.push(k);				// all element in E()
            else if (e instanceof Node)
              x.push(e);				// nodes
            else
              x.push(document.createElement(e));	// maybe HTMLUnknownElement
          }
      }
    dom(args);
    return E(x);
  };

// asynchronous Bidirectional communication queue
// q = new Q()
// popdata = await q.Push(pushdata)	=> waits until data was popped, returns the popdata
// pushdata = await q.Pop(popdata)	=> waits until data was pushed, sends popdata to sender
class Q
  {
  constructor() { this._i = []; this._o = []; this._single = single_run(_ => this._Step()) }

  Prio(...d)	{ return this.Proc(this._i, d, 1) }
  Push(...d)	{ return this.Proc(this._i, d) }
  Pop(...d)	{ return this.Proc(this._o, d) }
  Proc(a,d, prio)
    {
      const p = d.map(m => new Promise((ok,ko) => prio ? a.unshift([m,ok,ko]) : a.push([m, ok, ko])));
      this._single().catch(DONOTHING);
      //D('Q.Proc', a, d, p);
      return p.length==1 ? p[0] : Promise.all(p);
    }
  Clear()
    {
      var i = this._i;

      this._i = [];
      //D('Q.Clear');
      return Promise.all(i.map(m => P(m[2], 'cleared')));
    }
  async _Step()
    {
      //D('Q._Step');
      while (this._i.length && this._o.length)
        {
          const i = this._i.shift();
          const o = this._o.shift();

          //D('Q', i,o);
          await void 0;	// synchronous up to here, async from here
          P(o[1], i[0]);
          P(i[1], o[0]);
        }
    }
  _step(x)
    {
      //D('Q._step');
      this._single().catch(DONOTHING);
      return this;
    }
  };


//
// Helpers: The name says it all
//

function arrayCmpShallow(a,b)
{
  if (!a || !b || a.length != b.length)
    return false;

  for (var i=a.length; --i>=0; )
    if (a[i] !== b[i])
      return false;

  return true;
}

//
// Usable Crypto wrappers to the WTF implemented in Browsers
//

// WTF https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function SHA256hex(message)
{
  return await SHA256u8hex(new TextEncoder().encode(message));
}
// u8 can be Uint8Array or ArrayBuffer/ArrayBufferView
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/Uint8Array
async function SHA256u8hex(u8)
{
  return Array
    .from(new Uint8Array(await crypto.subtle.digest('SHA-256', u8)), b => b.toString(16).padStart(2, '0'))
    .join('');
}
SHA256hex('hw')
.then(_ => '91660cd41bd4fe159351ab036b7ca3e998602a9fec70b362ca11e0177fe706e3' == _)
.then(_ => _ ? _ : THROW('SHA256 error'))

// fn HANDLING DIFFERS from class ON!
//
// onoff = new OnOff();
// a = onoff.ON(fn, args..)	// register callback
// onoff.OFF(a)			// unregister callback
// onoff.trigger(triggerargs..)	// calls all the active fn(...args, ...triggerargs)
//
// If fn() returns truish, it will be removed (like a call to .off())
class OnOff
  {
  constructor() { this._fns = {} }
  on(...a) { this.ON(...a); return this }
  off(...a) { this.OFF(...a); return this }
  ON(fn,...a) { const i = Object(); this._fns[i]=[fn,a]; return i }
  OFF(...a) { for (var b of a) delete this._fns[b] }
  trigger(...a)
    {
      for (const [k,v] of Object.entries(this._fns))
        if (v[0].call(this, ...v[1], ...a))
          delete this._fns[k];
      return this;
    }
  }

//
// easy global state keeping
//
// st	= UrlState('id');	// location.hash keeps #id:val# where val is JSON
// console.log(st.state)	// get current value
// st.state = value		// change current value
// console.log(st.perm)		// retain current value (for URL back)
// st.perm = value		// retain current value and change it
//
// Triggers .on() if state changes (but not on something like: st.state = st.state)
class Keep extends OnOff
  {
  constructor(keeper, id)
    {
      super();
      this._k	= keeper;
      this._id	= id;
    }
  get state()
    {
      return this._k.get(this._id);
    }
  set state(v)
    {
      if (this._k.set(this._id, v))
        this.trigger(v, this._id, this)
    }
  get perm()
    {
      this._k.perm(this._id);
      return this._k.get(this._id);
    }
  set perm(v)
    {
      this._k.perm(this._id);
      this.state = v;
    }
  }

// keeper = new Keeper()
// state1 = new Keep(keeper, 'one')
// state2 = new Keep(keeper, 'two')
// state1.state = 'somestate';
// state2.state = 'otherstate';
//
// To make it permanent:
//
// keeper = new Keeper({}, (k,v) => if (k !== void 0) change(k,v) else perm(v))
// where:
// change(k,v) means key=k changed to value=v (v===void 0 if removed)
// perm(k) means key=k should be made permanent
// (If you do not need perm(), just ignore k===void 0 on change)
class Keeper
  {
  constructor(state, change, ...args)
    {
      this._change	= change || DONOTHING;
      this._args	= args;
      this._state	= state || {};
    }
  perm(s)  { this._change(...args, void 0, s) }
  get(s)   { return this._state[s] }
  states() { return Object.keys(this._state) }
  set(s,v)
    {
      if (s === void 0)	THROW('Keeper.set(undefined)');
      if (v === void 0)
        if (s in this._state)
          delete this._state[s];
        else
          return;	// no change
      else
        if (this._state[s] == v)
          return;	// no change
        else
          this._state[s]	= v;
      // propagate the change to the change function
      this._change(...this._args, s, v);
      return true;
    }
  }

class Cookie extends OnOff
  {
  constructor(name, path, samesite)
    {
      super();
      this.name	= name;
      this.path	= path || '/';
      this.val	= void 0;
      this.same	= samesite || 'Lax';

      const x = `${name}=`;
      for (var c of document.cookie.split(';'))
        {
          if (c.startsWith(' ')) c = c.substr(1);
          if (c.startsWith(x))
            {
              this.val	= UD(c.substr(x.length));
              this.trigger();
              break;
            }
        }
    }
  get $()	{ return this.val }
  set $(v)	{ return this._put(v, UE(v)) }
  del()		{ return this._put(void 0, '; expires=Thu, 01 Jan 1970 00:00:00 UTC') }
  trigger(...a)	{ super.trigger(...a, this.val); return this }
  _put(v, c)
    {
      c = `${this.name}=${c}; path=${this.path}; SameSite=${this.same}`;	// SameSite WTF?!?
      D('Cookie', c);

      this.val		= v;
      document.cookie	= c;

      return this.trigger();
    }
  };

const UrlState = (x => x())(function(){
  var reg;
  var perm;
  var save;
  var cookie;
  var keeper;

  function parse(ret, s)
    {
      const a	= s.split('#');

      a.pop();		// remove last element
      a.shift();	// remove first empty element
      for (var b of a)
       {
          const i = b.indexOf(':');
          if (i<0) continue;		// ignore crap
          const k	= UD(b.substring(0,i));
          var v	= UD(b.substring(i+1));
          try {
            v	= fromJ(v);
          } catch (e) {
            D('UrlState err', k, v, e);
            continue;			// ignore crap
          }
          ret[k]= v;
          D('UrlState has', k, v);
        }
    }
  function state(base)
    {
      const dat = [ base||'' ]

      for (const a of keeper.states())
        dat.push(UE(a)+':'+UE(toJ(keeper.get(a))));
      dat.push('');
      return dat.join('#');
    }
  function change(id,v)
    {
      if (id === void 0)
        {
          if (perm[v] !== keeper.get[v])
            save	= 1;
          return;
        }

      const url = state(location.href.split('#',1).shift());

      if (save)
        {
          D('UrlState new', id, v, url)

          location.assign(url);
          save	= 0;
          perm	= {};
          for (const a of keeper.states())
            perm[a]	= keeper.get(a);
        }
      else
        {
          D('UrlState tmp', id, v, url)
          location.replace(url);
        }
    }
  function init(_cookie)
    {
      reg	= new WeakMap();
      perm	= {};
      save	= 1;
      cookie	= _cookie;

      const set	= {};

      if (cookie)
        parse(set, cookie.$ || '');
      parse(set, location.hash);

      keeper = new Keeper(set, change);
    }

  init();
  function run(id) { return reg[id] || (reg[id] = new Keep(keeper, id)) }
  run.COOKIE	= function(name) { var c = new Cookie(name); init(c); return c }
  run.cookie	= function(name) { this.COOKIE(name); return this }
  run.set	= function () { if (cookie) cookie.$ = state(); return this }
  run.del	= function () { if (cookie) cookie.del(); return this }
  return run;
});


// Why no .POP()/.SHIFT()/.HEAD()/.TAIL()/.FIRST()/.LAST()?  Because this would be very confusing:
// Array.pop() removes the tail (most recent or last added element by Array.push())
// Array.shift() removes the head (least recent added or first element or Array.unshift())
// However in LRU head/tail/first/last are reversed, the most recent used/last added element is at LRU's head.
// Hence should .pop() remove the tail (as in Array) or the most recent added element (as in Array)?
// To avoid all this confusion, the interface does not use confusing names.
// (As usual: lowercase() returns this, Caps() returns Promise, ALLCAPS something else and _ are private)
class LRU		// Clean LRU key/value cache implementation
  {
    // DO NOT USE MEMBERS WHICH START WITH _ OUTSIDE OF THIS CLASS!

    constructor(max)
      {
        this.$max = max;
        this.clr();
      }

    //
    // return v:
    //

    get length(){ return this._size }				// compare Array.length
    get $len()	{ return this._size }
    get $max()	{ return this._max }
    set $max(m)	{ this._max = isInt(m) && m>0 ? m : 10 }	// this does no cleanup by purpose

    GET(k, def)	{ let e = this._get_(k); return e ? e.v : def }	// get key value (or default)
    DEL(k,d)	{ return this._get_(k) ? this.POPM().v : d }	// remove key (if exist) and return v (or default)

    //
    // return [k,v] (or void 0):
    //

    MOST(k,d)	{ return this._kv_(this._head, d) }		// most: most recent used element (or default void 0)
    LEAST(k,d)	{ return this._kv_(this._tail, d) }		// least: least recent used element
    POPM(d)	{ return this._kv_(this._free_(this._head), d) } // pop most recent (or default void 0)
    POPL(d)	{ return this._kv_(this._free_(this._tail), d) } // pop least recent (or default void 0)

    _kv_(e,def)	{ return e ? [e.k,e.v] : def }

    //
    // return this:
    //

    max(m)	{ this.$max = m; return this }			// set the max size.  This does no cleanup by purpose
    gc()	{ while (this._size > this._max) this._free_(this._tail) }

    del(k)	{ this.DEL(k); return this }			// remove element and return this
    delm()	{ this.POPM(); return this }			// remove most recent used
    dell()	{ this.POPL(); return this }			// remove least recent used

    clr()							// clear (empty) LRU
      {
        this._lru	= {};
        this._head	= void 0;
        this._tail	= void 0;
        this._size	= 0;
        return this;
      }
    set(k,v)							// add key with value to LRU
      {
        let e = this._get_(k);
        if (e)
          {
            e.v	= v;
            return this;
          }

        e = {k, v, n:this._head, p:void 0};
        this._new_(e)
        if (this._size > this._max)
          this._free_(this._tail);
        return this;
      }

    //
    // return e (or void 0):
    //

    _new_(e)							// add new element
      {
        if (!e) return void 0;
        this._lru[e.k]	= e;
        this._size++;
        D('LRU-new', this._size, this._max, e)
        return this._put_(e);
      }
    _free_(e)							// delete element (opposite of _new)
      {
        if (!e) return void 0;
        this._size--;
        delete this._lru[e.k];
        D('LRU-free', this._size, this._max, e)
        return this._rm_(e);
      }
    _get_(k)							// get element from key
      {
        let e = this._lru[k];
        return e ? this._head === e ? e : this._put_(this._rm_(e)) : void 0;
      }
    _rm_(e)							// remove element from it's position
      {
        if (!e) return void 0;
        if (e.p)
          e.p.n	= e.n;
        else if (this._head === e)
          this._head = e.n;
        else
          throw 'LRU head error';
        if (e.n)
          e.n.p	= e.p;
        else if (this._tail === e)
          this._tail = e.p;
        else
          throw 'LRU tail error';
        return e;
      }
    _put_(e)							// put element into top position (LRU)
      {
        if (!e) return void 0;
        e.p	= void 0;
        e.n	= this._head;
        if (e.n)
          e.n.p	= e;
        this._head = e;
        if (!this._tail)
          this._tail = e;
        return e;
      }
  };


//
// NOT IMPLEMENTED YET below
//

