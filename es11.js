'use strict';	// this is for ES11 aka ES2020

// TODO:
//
// Proper debug sealing.  Wrong usage must be reported via throw.
//
//	Object.seal() and Object.freeze() fail for debugging,
//	as they silently protect the object or class.
//	But I want prominent, best catastrophic errors to show up.
//
//	Hence we need to use Proxy()s while debugging,
//	replacing them with normal Object.freeze() or Object.seal()
//	in production (as this speeds things up in most browers).
//
// WeakMap possibly does not work on DOM objects at all.
//
//	WTF?  How to implement this properly then?
//	I thought it was meant for exactly that case!
//
// Implement private fields (when they become available?)
//
//	Currently stuidly emulated with _
//	Can we use WeakMap()[this] instead?  Easily?
//	(I did so in some other universe already.)

// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

// Rules for members in classes (NOT on toplevel functions):
// Uppercase or CamelCase which starts uppercase return "async function" or "Promise".
// All lowercase returns "this".  Always.
// Starting with $ are getter/setter with just $ is what you expect most (the wrapped object, etc.)
// mixedCaps or ALLCAPS or functions with _ in the name or ending on it return anything.
// Starting with _ is private, the first _ is skipped to apply the rules above.
//
// If something takes a function as argument, the argument list usually ends on (fn, ...args):
// - This then calls the function as              fn(e, ...args)
// - If name ends on $  the call becomes          fn.call(e, ...args)
// - If name ends on $$ it becomes (fn, args) and fn.apply(e, arg)

// <script src="es11.js" data-debug></script>
// data-debug enables debugging
let DEBUGGING = document.currentScript?.dataset?.debug;		// you can change this later

const _FPA = Function.prototype.apply;
const _FPC = Function.prototype.call;
const DONOTHING = function(){}					// The "do nothing" DUMMY function
let CONSOLE = (...a) => { console.log(...a) };			// returns void 0 for sure (and changeable)

// sorted ABC, commented names are below
const AsyncFun	= Object.getPrototypeOf(async function(){}).constructor;
const C = (fn,...a) => function (...b) { return fn(...a,...b) }	// Curry (allows to bind this)
const C$ = (fn,self,...a) => C$$(fn,self,a);			// Curry Call (with self)
const C$$ = (fn,self,a) => (...b) => _FPC.call(fn,self,...a,...b);	// Curry Apply (with self)

const CA = C$$, CC = C$;	// deprecated

//const CT = (fn,...a) => CA(fn,this,a)				// instead use: C(this.fn,a) or CC(fn,this)
const D = (...a) => DEBUGGING ? CONSOLE('DEBUG', ...a) : void 0;
const DD = (...a) => DEBUGGING ? C(D,...a) : DONOTHING		// log = DD('err in xxx'); log('whatever')
//DONOTHING
const DomReady	= new Promise(ok => document.readyState==='loading' ? document.addEventListener('DOMContentLoaded', ok) : ok);
//E() see below
//Get()	fetch via 'GET'
const isFunction= f => typeof v === 'function';			// https://stackoverflow.com/a/6000009
const isObject	= o => o?.constructor === Object;		// https://stackoverflow.com/posts/comments/52802545
const isString	= s => s?.constructor === String;		// https://stackoverflow.com/a/63945948
const isArray	= a => Array.isArray(a);
const isInt	= i => Number.isInteger(i);
//KO()
const mkArr = x => Array.isArray(x) ? x : [x];			// creates single element array from non-Array datatypes
const defArr = (x,d) => { x=mkArr(x); return x.length ? x : mkArr(d) }	// same as mkArr, except for [] which becomes default array

// I hate this.  Why is debugging Promises so hard?  Why isn't it built in?
// Promise.resolve().then(_ => randomly_failing_function()).then(OK).catch(KO).then(...OKO('mypromise'))
const KO = (e, ...a) =>	{ D('catch', e, ...a); throw e }	// Promise.reject().catch(KO).then(not_executed)
const OK = (v, ...a) =>	{ D('then', v, ...a); return v }	// Promise.resolve().then(OK).then(..)
const OKO = (...a) =>	[ v => OK(v, ...a), e => KO(e, ...a) ]	// Promise.reject.then(...OKO('mypromise')).then(not_executed)
const KOK = (...a) =>	DD(...a)				// Promise.reject().catch(KOK('shown when fail&debug')).then(..)
const IGN = (...a) =>	(...b) => CONSOLE(...a, ...b)		// Promise.reject().catch(IGN('error is ignored')).then(..)

// Create real Error()s on catch chains for better processing.
//
// https://developer.mozilla.org/en-US/docs/Web/API/Error
// Error() is NOT standardized, however .stack and .lineNumber etc. are supported in most browsers.
// https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
// ErrorEvent() IS standardized, but does NOT contain .stack and it is barely documented.
//
// You can only rely on:
// .message
// .stack
// everything else is too browser specific
//
// Promise.reject('throw').catch(THROW).catch(e => bug(e.message, e.stack))
const THROW = e => { e = e instanceof Error ? e : e instanceof ErrorEvent ? new Error(e.message, e.filename, e.lineno, e.colno) : new Error(e); D('ERROR', e); throw e }

// P(fn, args) is short for: new Promise((ok,ko) => { try { ok(fn(args)) } catch (e) { ko(e) })
const PR = Promise.resolve();	// PRomise
const PE = Promise.reject();	// PromisErr
PE.catch(DONOTHING);		// shutup "Uncaught in Promise" due to PE
const P = (fn,...a) => PR.then(() => fn(...a));		// invoke fn(a) in microtask: P(fn,a).then(..).catch(..). See also single_run()
const P$ = (fn,self,...a) => P$$(fn,self,a);		// invoke fn(a) with this===self
const P$$ = (fn,self,a) => PR.then(() => _FPA.call(fn, self, a));	// same as P$ but with arguments in array (for optimization)

const PC = P$;	// deprecated

const fromJ	= o => JSON.parse(o);
const toJ	= o => JSON.stringify(o);

const SleeP	= (ms,v) => new Promise(ok => setTimeout(ok, ms, v));		// await SleeP(10).then(..)
const SleEp	= (ms,e) => new Promise((ok,ko) => setTimeout(ko, ms, e));	// await SleEp(10).catch(..)
const sleepFn	= ms => r => SleeP(ms, r);					// .then(sleepFn(10)).then(..)
const sleepErr	= ms => e => SleEp(ms, e);					// .catch(sleepErr(10)).catch(..)


// fetch() promises
const Fetch	= (u, o) => fetch(u,o).then(r => r.ok ? r : Promise.reject(`${r.status}: ${r.url}`))
const Get	= u => Fetch(u, { cache:'no-cache' })
const _MTFUD	= (m,t,f) => (u,d) => Fetch(u, { cache:'no-cache', method:m, headers:{'Content-Type':t}, body:f ? f(d) : d })
const PostText	= _MTFUD('POST', 'text/plain')
const PutText	= _MTFUD('PUT', 'text/plain')
const _MUJ	= m => _MTFUD(m, 'application/json', JSON.stringify)
const PostJSON	= _MUJ('POST')
const PutJSON	= _MUJ('PUT')

const _Json	= p => p.then(r => r.status==200 ? r.json() : THROW(r.status))
const _Text	= p => p.then(r => r.status==200 ? r.text() : THROW(r.status))
const GetText	= u => _Text(Get(u))
const GetJSON	= u => _Json(Get(u))

// Escape URI and (only the problematic) HTML entities
// As there are gazillions of named HTML entities (and counting)
// we do NOT want to support them.  Never.  Sorry.
const UE = x => encodeURIComponent(x);	// URLencoded WTF? I almost broke a finger typing this!
const UD = x => decodeURIComponent(x);	// URLdecoded WTF? BTW: Out of 666 characters long names?
const HE = x => String(x).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);		// HTMLencoded
const HD = x => String(x).replace(/&#(\d)+;/g, (s,c) => String.fromCharChode(c));	// HTMLdecoded
const HU = x => HE(UE(x));		// HTML+URLencoded special short form		(for inclusion in literal DOM)
const JU = x => UE(toJ(x));		// JSON URLencoded special short form		(for inclusion in URL)
const JHU = x => HU(toJ(x));		// JSON HTML+URLencoded special short form	(for inclusion in literal DOM)

// Dummy support for perhaps missing WeakRefs.  (This is mainly for Babel)
// The fallback is not good as it leaks memory, but we cannot implement this any better way here.
const es11WeakRef = (() =>
  {
    try {
      new WeakRef({});
      CONSOLE('es11WeakRef supported');
      return WeakRef;
    } catch {
      CONSOLE('es11WeakRefs faked');
      // Not a working WeakRef mixin
      // (This cannot be implemented with WeakMap)
      return class
        {
        constructor(o) { this._o = o }
        deref() { return this._o }
        }
    }
  })();


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// OVERVIEW: (sync:immediately, async:microtask, cycle:task queue, frame:animation frame)
//
// r=tmpcache(fn,a):		sync: r(b) caches fn(a), but only in this cycle
// r=single_run(fn,a):		async: r(b) runs fn(a,b) if it not already runs, else re-runs last invocation when fn(a,b) finishes
// r=once_per_cycle(fn,a):	cycle: r(b) runs fn(a,b) once on end of cycle. r(b) returns unused arguments (previous invocation not realized)
// r=once_per_frame(fn,a):	frame: as once_per_cycle() but on animation frame.
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Temporarily cache something expensive (expires at the next loop)
// This is mainly for class methods like getters as it distinguishes on 'this'.
// However it should work with global function, too, as here 'this' is window.
const tmpcache = (fn,...a) =>			// use a real function here to provide 'this'
{
  let ret;
  return function ()				// we cannot have args here, as this would change the outcome
    {						// must be function as we need 'this' for caching
      if (ret)
        {
          if (this in ret)
            return ret[this];			// cached value
        }
      else
        {
          ret	= new WeakMap();		// temporary cache
          setTimeout(_ => ret = void 0);	// expire at next loop
        }
      ret[this]	= void 0;	 		// avoid recursion
      return ret[this] = fn.apply(this, a);	// cache real value (from this cycle)
    }
};

class Cancelled
  {
  constructor(...a) { this._a = a }
  get cancelled() { return this._a }
  };

// Run something a single time in backround where only the last invocation is cached.
// Usage is to update something expensive, such that if multiple updates come in while it is updated, those are skipped except of the latest one.
//
// single_run(fn,a) returns a function which, when invoked, starts the given fn asynchronously with the given args, such that it never runs twice.
// If the fn still runs further invocations are cached and run afterwards.  But only the last invocation survives, all othere throw a Cacnelled exception.
//
// Example:
//
// r = single_run(fn, a);
// r(b).then(
//           val => process(val)
//           ,
//           err => err.cancelled ? was_cancelled(err) : other_error(err)
//          )
//
// - single_run(fn,a) returns a function (here called r)
//   In future this might change to a callable class which encapsulates it all.
// - r(b) returns a Promise which resolves to the return value (or error) of fn(a,b)
// - Until this Promise is resolved, further calls to r(x) are delayed until the Promise resolves
// - If another r(y) arrives while r(x) is waiting, r(x) is cancelled with the Cancelled() class (which does not derive from Error by purpose).
//   r(y) replaces r(x) this way
// - On Cancelled() the .cancelled property returns the (truthy) array of the given arguments which replaced the r(x) (the [a,y])
//   Hence you can test with something like .catch(e => { if (e.cancelled) ..
//   This also works with try { await r(y) } catch (e)  { if (e.cancelled) ..
const single_run = (fn, ...a) =>
  {
    let invoke, running;

    const run = async (...a) =>
      {
        //D('SR', 'wait', a);
        await void 0;		// run asynchrounously
        //D('SR', 'run', a);
        return fn(...a);	// in case it is a Promise
      };
    const loop = () =>
      {
        running = invoke;
        invoke = void 0;
        //D('SR', 'loop', running)
        if (running)
          run(...running[0], ...running[1]).then(running[2], running[3]).finally(loop)
      }
    return (...b) => new Promise((ok, ko) =>
      {
        const was = invoke;
        //D('SR', 'exec', fn, a, invoke);
        invoke = [a,b,ok,ko];
        if (was)
          was[3](new Cancelled(a,b));
        if (!running)
          loop();
      })
  };

// Wrap a functioncall such, that it is only called once in a cycle or frame:
//
// const doitonce = once_per_cycle(console.log)
// doitonce(1);         // returns void 0
// doitonce(2,3,4);     // returns [1]
// doitonce('x');       // returns [2,3,4]
// await relax();       // console.log('x') is executed
//
// Only the last parameters from the call survive.  Previous parameters are returned by the wrapper.
//
// If the executed function recursively calles the wrapper, this is ignored, so x=void 0 is at the correct place.
// If a once_per_cycle() function calles a new once_per_cycle(), it is executed immediately, but only once.
// Hence there cannot be an endless loop caused by this, each routine only is called once per cycle, at maximum.
const _run_once = _ => (f => f(_))(later =>
  {
    let run, block;
    const exec = () =>
      {
        block = [];             // create unique semaphore
        try {
          let x;
          while (x=run.pop())
            x();
        } finally {
          run   = void 0;
          block = void 0;       // drop used semaphore
        }
      }
    return (fn,...a) =>
      {
        let x, done = [];       // no previous semaphore
        const call = () => { if (block!==done) { done=block; fn(...a,...x) } }; // run if semaphore changed
        if (block)
          throw new Exception('once_per_cycle() called from within function executing once per cycle');
        return (...b) =>
          {
            const was = x;
            x = b;
            if (block===done)
              return b;			// we return the args, which are not used (already used: was)
            if (block)
              {
                call();			// we are within once-per-cycle, so run it immediately
                return was;		// we return the args, which are not used (just used: a)
              }
            // we are outside once-per-cycle here
            if (was) return was;	// we return the args, which are not used (will use: a)
            if (!run)
              {
                later(exec);		// process everyting once after this cycle (and Microtasks)
                run     = [];
              }
            run.push(call);		// build list what to do in run[]
          }
      }
  });
const once_per_cycle = _run_once(_ => setTimeout(_));
const once_per_frame = _run_once(_ => window.requestAnimationFrame(_));

// ON-Event class (in the capture phase by default)
// If the handling returns trueish, processing of the event stops (this is the exact opposite of old DOM).
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

  add(fn, ...a)		{ return this.add$$(fn,a) }
  add2(fn, ...a)	{ return this.add$$(function (...a) { fn(this,...a) }, a) }
  add$$(fn, a)		{ this._fn.push([fn,a]); return this }
//remove(fn, ...a)	{ this._fn.remove([fn,a]); return this }	does not work this way

  handleEvent(ev)
    {
      this.$ = ev;
      for (const a of this._fn)
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
      for (const a of l)
        {
          const o=l.deref();
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

const FRAGMENT = () => document.createDocumentFragment();

// https://hackernoon.com/creating-callable-objects-in-javascript-d21l3te1
class Callable extends Function
  {
  constructor()
    {
      super('...args', 'return this._bound._call(...args)');
      this._bound = this.bind(this);
      return this._bound;
    }
  // _call(...a) { .. } must be implemented in subclass
  };

// This is an element wrapper (not really like jQuery).
// const input = E().DIV.text('hello world ').INPUT;
class _E0 extends Callable
  {
  constructor(e)	{ super(); this._e = (this._E = e ? mkArr(e) : [])[0] || FRAGMENT() }
  get $()		{ return this._e; }
  get $all()		{ return this._E; }

  rm()			{ for (const e of this._E) e.remove(); return this }
  remove()		{ return this.rm() }
  clr()			{ let a; for (const e of this._E) while (a = e.firstChild) a.remove(); return this }

  *[Symbol.iterator]()	{ for (const e of this._E) yield e }
  *MAP(fn, ...a)	{ for (const e of this._E) yield fn(e, ...a) }
  Run(fn, ...a)		{ return P(fn, this, ...a) }
  Run$(fn, ...a)	{ return P$$(fn, this, a) }
  Run$$(fn,a)		{ return P$$(fn, this, a) }
  run(fn, ...a)		{ fn(this, ...a); return this }
  run$(fn, ...a)	{ fn.apply(this, a); return this }
  run$$(fn,a)		{ fn.apply(this, a); return this }

  forEach(...a)		{ return this.run(...a) }

  debug(...a)		{ console.log('debug', ...a, this._E); return this }
  };

class _E extends _E0
  {
  constructor(e)	{ super(e); this._cache = {} }

  get $$()		{ return E(this._e?.parentNode); }

  // E().ALL(selector) queries on the document
  // but: E().clr() does NOT clear the document!
  ALL(sel)
    {
      const ret = [];
      for (const e of defArr(this._E, document))
        e.querySelectorAll(sel).forEach(_ => ret.push(_));
      const r = E(ret);
      D('ALL', sel, r);
      return r;
    }
  NAME(n)
    {
      const ret = [];
      for (const e of defArr(this._E, document))
        e.getElementsByName(n).forEach(_ => ret.push(_));
      const r = E(ret);
      D('NAME', n, r);
      return r;
    }

  focus()		{ this._e?.focus(); return this }

  get $x()		{ return this._pos().x }
  get $y()		{ return this._pos().y }
  get $w()		{ return this._e.offsetWidth }
  get $h()		{ return this._e.offsetHeight }
  x(x)			{ return this.style({left:`${x}px`}) }
  y(y)			{ return this.style({top:`${y}px`}) }
  w(_)			{ const w=`${_}px`; return this.style({width:w,maxWidth:w}) }
  h(_)			{ const h=`${_}px`; return this.style({height:h,maxHeight:h}) }
  set $x(_)		{ this.x(_) }
  set $y(_)		{ this.y(_) }
  set $w(_)		{ this.w(_) }
  set $h(_)		{ this.h(_) }
  get $xy()		{ const p = this._pos(); return [ p.x, p.y ] }
  get $wh()		{ return [ this._e.offsetWidth, this._e.offsetHeight ] }
  get $xywh()		{ const p = this._pos(); return [ p.x, p.y, this._e.offsetWidth, this._e.offsetHeight ] }
  get $XYWH()		{ const p = this._pos(); p.w = this._e.offsetWidth; p.h = this._e.offsetHeight; return p }
  get $rb()		{ const p = this._pos(); return [ p.x+this._e.offsetWidth, p.y+this._e.offsetHeight ] }
  get $ltrb()		{ const p = this._pos(); return [ p.x, p.y, p.x+this._e.offsetWidth, p.y+this._e.offsetHeight ] }
  get $LTRB()		{ const p = this._pos(); return { left:p.x, top:p.y, right:p.x+this._e.offsetWidth, b:p.y+this._e.offsetHeight } }
  _pos = tmpcache(function ()
    {
      let o = this._e;
      let x = o.offsetLeft;
      let y = o.offsetTop;
      while (o = o.offsetParent)
        {
          x	+= o.offsetLeft;
          y	+= o.offsetTop;
        }
      return { x, y }
    })

// setting is NOT supported due to caching
//E(e)			{ return this.e(e).$ }
//set $(e)		{ this._e = e === void 0 ? e : isString(e) ? document.getElementById(e) : e }
//e(e)			{ if (e) this._e = e; return this }

  get $tag()		{ return this._e.nodeName }	// DIV, SPAN, etc.
  get $text()		{ return this._e.textContent }	// innerText causes reflow
  set $text(s)		{ return this._e.textContent = s }	// innerText has bad siedeffects on IE<=11
  get $align()		{ return this._e.align }
  set $align(a)		{ this._e.align = a }
  get $value()		{ return this._e.value }
  set $value(v)		{ this._e.value = v }
  get $src()		{ return this._e.src }
  set $src(u)		{ this._e.src = u }
  get $alt()		{ return this._e.alt }
  set $alt(u)		{ this._e.alt = u }
  get $checked()	{ return this._e.checked }
  set $checked(b)	{ this._e.checked = !!b }
  get $disabled()	{ return this._e.disabled }
  set $disabled(b)	{ this._e.disabled = !!b }
  get $class()		{ return this._e.classList }
  // XXX TODO XXX missing: .$class = [list] so this is idempotent: .$class = .$class
  // .$class = {classname:true, classname2:false}
  set $class(o)		{ for (const a in o) this._e.classList.toggle(a, o[a]); return this }

  // Only create Style-class if it is really needed
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
  align(a)		{ this.$align = a; return this }
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

  // All TAGs
  get DIV()		{ return this._MK('div') }
  get PRE()		{ return this._MK('pre') }
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
  get RADIO()		{ return this._MK('input', {type:'radio'}) }
  get TEXTAREA()	{ return this._MK('textarea') }
  get TABLE()		{ return this._MK('table') }
  get BUTTON()		{ return this._MK('button') }
  get SELECT()		{ return this._MK('select') }
  get OPTION()		{ return this._MK('option') }
  get FORM()		{ return this._MK('form') }
  get LABEL()		{ return this._MK('label') }

  get TT()		{ return this._MK('tt') }
  get CODE()		{ return this._MK('code') }

  th(...a)		{ for (const t of a) this.TH.text(t); return this }
  td(...a)		{ for (const t of a) this.TD.text(t); return this }

  get $options()	{ return (function *() { for (const a of this._e.selectedOptions) yield E(a) }).call(this) }
  get $option()		{ return E(this.$?.selectedOptions[0]) }
  set $option(s)	{ for (const a of this._e.options) if (a.value == s) return a.selected = true }

  selected(state)	{ if (state != void 0) this._e.selected = !!state; return this }

  updater(fn, ...a)	{ this._upd = [fn,a]; return this }
  UPDATE(...a)		{ return this._upd[0](this, ...this._upd[1], ...a) }
  update(...a)		{ this.UPDATE(...a); return this }
  UPD(...a)		{ return _ => { this.UPDATE(...a, _); return _ } }	// Promise.resolve(1).then(el.UPD()).then(_ => _===1)

  ON(type, fn, ...a)	{ return new ON(type).add(fn, this, ...a).attach(this) }
  on(...a)		{ this.ON(...a); return this }

  target(id)		{ return this.attr({target:(id === void 0 ? '_blank' : id)}) }
  href(href)		{ return this.attr({href}) }
  id(id)		{ return this.attr({id}) }
  name(name)		{ return this.attr({name}) }
  attr(a)		{ if (a) for (const b in a) for (const e of this._E) if (a[b] === void 0) e.removeAttribute(b); else e.setAttribute(b, a[b]); return this }
  style(a)		{ if (a) for (const b in a) for (const e of this._E) e.style[b] = a[b]; return this }
  // prepend/append to parent
  get prep()		{ return (...c) => { const n=this._e, f=FRAGMENT(); if (n) for (const a of c) for (const b of E(a)) f.append(b); n.prepend(f); return this } }
  set prep(c)		{ this.prep(c) }
  add(...c)		{ const n=this._e; if (n) for (const a of c) for (const b of E(a)) n.append(b); return this }
  // prepend/append relative to current
  before(...c)		{ const n=this._e; if (n) for (const a of c) for (const b of E(a)) n.before(b); return this }
  after(...c)		{ let n=this._e; if (n) for (const a of c) for (const b of E(a)) { n.after(b); n=b }; return this }
  attach(p)		{ E(p).add(this); return this }

  get FIRST()		{ return E0(this._e?.firstChild) }
  get LAST()		{ return E0(this._e?.lastChild) }
  get PREV()		{ return E0(this._e?.previousSibling) }
  get NEXT()		{ return E0(this._e?.nextSibling) }

  setclass(o)		{ this.$class = o }
  addclass(...c)	{ this.$class.add(...c); return this }
  rmclass(...c)		{ this.$class.remove(...c); return this }
  replaceclass(old,c)	{ this.$class.replace(old,c); return this }
  toggleclass(...c)	{ for (const a in c) this.$class.toggle(a); return this }
  has_class(c)		{ return this.$class.contains(c) }

  Loaded()		{ return Promise.all(Array.from(this.MAP(_ => _.decode()))) }
  };

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
const E0 = _ => _ ? E(_) : void 0;	// or null?
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

      let w = weak_refs.get(e);
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
    const has = new Set();
    const x=[];

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

// Asynchronous Bidirectional Communication Queue
// q = new Q()
// popdata = await q.Push([pushdata]..)	=> waits until pushdata was popped, returns the popdata
// pushdata = await q.Pop([popdata]..)	=> waits until pushdata was pushed, transfers popdata to pusher
// And you do not need to wait for Push()/Pop(), as these are Promises.
//
// Note that you can push/pop multiple messages:
// q.Push(msg1, msg2, msg3).then(ans => console.log('msg1',ans[0], 'msg2',ans[1], 'msg3',ans[2]))
// q.Pop('ans1','ans2','ans3');		// But there is no synchronization!
//
// Why?  Because of symmetry.  Consider:
// q.Push(A)		gives	q.Pop() === A		so
// q.Push(['a','b'])	gives	q.Pop() == ['a','b']	but:
// q.Push('a','b')	gives	q.Pop() == ['a','b']	as well?!?  Or what should it give instead?
//
// In contrast for this implementation:
// q.Push(A) === B		vs.	q.Pop(B) === A
// q.Push(A,B) == [C,D]		vs.	q.Pop(C,D) == [A,B]
// q.Push(A,B) == [C,D]		vs.	q.Pop(C) === A; q.Pop(D) === B
// q.Push(A)===C; q.Push(B)===D	vs.	q.Pop(C,D) == [A,B]
// So you know what comes out by what you have put in.
// Completely different to the "naive" case.
// (Alternatively we could not support multiple arguments.  But why?)
class Q
  {
  constructor() { this._i = []; this._o = []; this._single = single_run(_ => this._Step()) }

  Prio(...d)	{ return this.Proc(this._i, d, 1) }
  Push(...d)	{ return this.Proc(this._i, d) }
  Pop(...d)	{ return this.Proc(this._o, d) }
  Proc(a,d, prio)
    {
      if (!d.length) d=[void 0];	// q.Pop() is same as q.Pop(void 0)
      const p = d.map(m => new Promise((ok,ko) => prio ? a.unshift([m,ok,ko]) : a.push([m,ok,ko])));
      this._single().catch(DONOTHING);
      D('Q', a === this._i ? 'push' : 'pop', a.length, prio||0, d, p);
      return p.length==1 ? p[0] : Promise.all(p);
    }
  Clear()
    {
      const i = this._i;

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

const arrayCmpShallow = (a,b) =>
{
  if (!a || !b || a.length != b.length)
    return false;

  for (const i=a.length; --i>=0; )
    if (a[i] !== b[i])
      return false;

  return true;
}

//
// Usable Crypto wrappers to the WTF implemented in Browsers
//

// u8 can be Uint8Array or ArrayBuffer/ArrayBufferView
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/Uint8Array
const SHA256u8hex = async (u8) => window.crypto?.subtle
    ? Array
      .from(new Uint8Array(await crypto.subtle.digest('SHA-256', u8)), b => b.toString(16).padStart(2, '0'))
      .join('')
    : THROW('window.crypto.subtle not available');

// WTF https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const SHA256hex = (message) => SHA256u8hex(new TextEncoder().encode(message));

SHA256hex('hw')
.then(_ => '91660cd41bd4fe159351ab036b7ca3e998602a9fec70b362ca11e0177fe706e3' == _)
.then(_ => _ ? _ : THROW('SHA256 testvalue failed'))
.then(_ => console.log('SHA256 ok'), _ => console.log('SHA256 unavailable', _));

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
  constructor() { this._fns = new Map() }
  on(...a) { this.ON(...a); return this }
  off(...a) { this.OFF(...a); return this }
  ON(fn,...a) { const i = Object(); this._fns.set(i,[fn,a]); return i }
  OFF(...a) { for (const b of a) delete this._fns.delete(b) }
  trigger(...a)
    {
      for (const [k,[f,b]] of this._fns.entries())
        if (f.call(this, ...b, ...a))
          delete this._fns.delete(k);
      return this;
    }
  };

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

// Cookie('name')
// Cookie({name, path, samesite, secure, httponly, domain, expire})
// .$	= value;	// to set
// .$	= void 0;	// to remove
// .del()		// to remove
//
// .on() is triggered if Cookie value exists or changes
// .on() is also triggered if Cookie value is not matching
class Cookie extends OnOff
  {
// There is not enough support for private fields yet (2021-02):
//  #val; #exp; #dom; #sec; #path; #same; #name; //#http

  constructor(name)
    {
      super();
      const opt	= isObject(name) ? name : { name };
      this._name	= opt.name || 'cookie';
      this.$path	= opt.path || '/';
      this.$samesite	= opt.samesite || 'Lax';	// WTF?  It DOES NOT DEFAULT to Lax as MDN says!
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
      // Cookies created via JavaScript cannot include the HttpOnly flag.
      // Why?  Shouln't there be a way to allow overwriting certain such Cookies by JS?
      //this.$httponly	= opt.httponly;
      this.$domain	= opt.domain;
      this.$expire	= opt.expire;
      this.$secure	= opt.secure || location.protocol == 'https:';

      // get the current value
      this._val		= void 0;
      const x = `${name}=`;
      for (let c of document.cookie.split(';'))
        {
          if (c.startsWith(' ')) c = c.substr(1);
          if (c.startsWith(x))
            {
              this._val	= UD(c.substr(x.length));
              this.trigger();
              break;
            }
        }
    }
  get $name()	{ return this._name }
  get $secure()	{ return this._sec }
  set $secure(d) { this._sec = !!d }
  get $path()	{ return this._path }
  set $path(d)	{ this._path = d }
  get $samesite() { return this._same }
  set $samesite(d) { this._same = d && UE(d) }		// XXX TODO XXX check parameters for correctness (UE as workaround)
  //get $httponly() { return this._http }
  //set $httponly(d) { this._http = !!d }
  get $domain()	{ return this._dom }
  set $domain(d) { this._dom = d && UE(d) }		// XXX TODO XXX check domain for correctness (UE as workaround)
  get $expire()	{ return this._exp }
  set $expire(d) { this._exp = d && new Date(d).toUTCString() }

  get $()	{ return this._val }
  set $(v)	{ return this._put(v) }

  set $cmp(v)	{ if (this._val !== v) this.trigger(v) }

  del()		{ return this._put() }
  trigger(...a)	{ super.trigger(...a, this._val); return this }
  _put(v)
    {
      let c	= '';
      const d	= this._dom ? `; Domain=${this._dom}` : '';
      let e	= 'Thu, 01 Jan 1970 00:00:00 UTC';
      //const h	= this._http ? `; HttpOnly` : '';
      const n	= this._sec ? `; Secure` : '';
      const p	= this._path === void 0 ? '' :  `; Path=${UE(this._path)}`;
      const s	= this._same ? `; SameSite=${this._same}` : '';
      if (v !== void 0)
        {
          if (v === this._val)
            return this;	// nothing changed, no need to trigger

          c	= UE(v);
          e	= this._exp || '';
        }
      if (e)
        e	= `; Expires=${e}`;

      c = `${this.name}=${c}${d}${e}${n}${p}${s}`;
      D('Cookie', c);

      this._val		= v;
      document.cookie	= c;		// SameSite WTF?!?  Without SameSite parameter this does not work as excepted?!?

      return this.trigger();
    }

/*
  // Create a Cookie-Switch class:
  // SWITCH('name', callback)
  // SWITCH({name,class,set,del})
  // This creates two hidden checkboxes with the given name and labels.
  // Left is ON/Save which has 3 state classes: green yellow red
  // Right is Delete which has 2 state class:   grey black
  SWITCH(opt)
    {
      const c = sel.BUTTON.text('set').on('click', _ => set(this));
      const d = sel.BUTTON.text('del').on('click', _ => del(this));
      this.on(a =>
        {
          d.disabled(!a);
          c.$class = { CookieButtonGreen:!!a, CookieButtonRed:!a };
          d.$class = { CookieButtonGrey:!a }
        });
      return this.trigger();
    }
*/
  };

// Generic switch class for radio like switches plus some CSS to layout
// new Switch(parent, 'NAME', 'CLASS').add('first').add('second').on(callback).trigger()
// new Switch(parent).name('NAME').css('CLASS').add(
// If 'CLASS' is missing, the given NAME is used.
// If 'NAME' is missing, a unique one is created.
//
// Note:
//
// The labels set CSS { user-select:none } to prevent acidentally selecting instead of clicking the button.
// If you do not like that and other automatic things, use .quirks(), then everything must be done with classes.
//
// .$			is the current value of the given input
// .$ = TEXT		re-assign the label contents of the currently checked input
// .$nr			returns the integer value of the currently checked input value, which is filled by .add() with the number starting by 0
// .$nr = NR		same as: .nr(NR)
// .$class		is the CLASS of currently checked input, by default this returns CLASS-on
// .$class = 'other'	same as: .class(.$nr, 'OTHER')
//
// .quirks()		disable quirks
// .quirks(true)	(default) enable quirks, that is, set some default CSS attributes directly
// .css('CLASS')	changes the CSS class
// .name('NAME')	changes the NAME
// .on()		(see OnOff) is called if something changes
//
// .add(TEXT, cb, args)	adds a button and run CB with args when the button is selected.  `this` is the Switch class
// .ADD(TEXT, cb, args)	same, but returning the generated number of the given button
//
// .select(nr)		select the given button.  This is the same as user clicking the button
// .class(nr, CLASS)	temporarilt change the class of the given button - this reverts to default on any interaction
// .rm(nr)		remove the given button
// .set(nr, TEXT)	change the label contents
//
// A switch is a hidden {display:none; position:absolute} named radiobutton with a label which can be styled as you like.
// The CSS class can be used to style the <label> elements.
// As ":has()" and parent selectors are not available in CSS yet and I do not like to create 'for'-attributes,
// all the classes are programattically assigned by JavaScript by adding a certain suffix:
//
// CLASS-off		if the button is not selected
// CLASS-on		if the button is selected
//
// To represent N-state on a button, you can use .class() or .$class.
//
// Initially the Switch has no buttons, so you must .add() them.
/*
class Switch extends OnOff
  {
//    #name; #class

    constructor(parent, name, klass)
      {
        this._el	= parent ? E(parent) : E.FORM;
        this._name	= name || _UniqueName();
        this._class	= klass || name;
      }
    set $class(c)	{ this.class(this.$nr, c) }
    set $nr(nr)		{ this.nr(nr) }

    add(text, cb, ..args)
      {
        
      }
  };
*/

const UrlState = (x => x())(function(){
  let reg;
  let perm;
  let save;
  let cookie;
  let keeper;

  function parse(ret, s)
    {
      const a	= s.split('#');

      a.pop();		// remove last element
      a.shift();	// remove first empty element
      for (const b of a)
       {
          const i = b.indexOf(':');
          if (i<0) continue;		// ignore crap
          const k	= UD(b.substring(0,i));
          let v	= UD(b.substring(i+1));
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
  function buttons(name, el, set, del)
    {
      name	= name || 'state';
      el	= E(el || name);
      const c	= el.BUTTON.text(set || 'set').on('click', _ => UrlState.set());
      const d	= el.BUTTON.text(del || 'del').on('click', _ => UrlState.del());
      run.COOKIE(name).on(a => { d.disabled(!a); c.$class = { green8:!!a, red8:!a }; d.$class = { grey8:!a } }).trigger();
      return this;
    }

  init();
  function run(id) { return reg[id] || (reg[id] = new Keep(keeper, id)) }
  run.COOKIE	= function(name) { const c = new Cookie(name); init(c); return c }
  run.cookie	= function(name) { this.COOKIE(name); return this }
  run.buttons	= buttons;
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

    async Def(k,f,...a)	{ const e = this._get_(k); if (e) return e.v; const v = await f(...a); this.set(k,v); return v; }
    DEF(k,f,...a)	{ const e = this._get_(k); if (e) return e.v; const v =       f(...a); this.set(k,v); return v; }
    GET(k, def)	{ const e = this._get_(k); return e ? e.v : def }	// get key value (or default)
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


// Cache class able of caching multiple values
// w = new WeakCache()
// w.GET([], () => 1)		returns 1
// w.SET([], 2)
// w.GET([], void 0, 3)		returns 2
// This is weak on the keys passed in via the first array
class WeakCache
  {
//  #c; #f; #a

  constructor(fn, ...args)
    {
      this._c	= [ new WeakMap() ];
      this._f	= fn || (_ => _);
      this._a	= args;
    }
  get factory()
    {
      return (...args) => this.GET(args);
    }
  _map(arr)
    {
      let map = this._c;
      for (const i of arr)
        {
          let w = map[0].get(i);
          if (!w)
            {
              w	= [ new WeakMap() ];
              map.set(i, w);
            }
        }
      return map;
    }
  set(arr, val)
    {
      this._map(arr)[1] = val;
      return this;
    }
  GET(arr, filler, ...args)
    {
      const map = this._map(arr);
      return map.length==2 ? map[1] : map[1] = (filler || this._f)(...(args || this._a), arr);
    }
  };


//
// NOT IMPLEMENTED YET below
//

