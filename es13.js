'use strict';	// this is for ES13 aka ES2022
// In future: sed -i 's/__\([a-zA-Z]\)/#\1/g'
// Do not try to access __ things, as IT WILL FAIL in future!

// TODO:
//
// - Allow this to be loaded as Module, too.
// - Better Worker support.
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
// Implement private fields (.. perhaps ..)
//
//	Currently stupidly emulated with __
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

// <script src="es13.js" data-debug></script>
// data-debug enables debugging
try { // Else workers die if you try to access 'document', which is plain bullshit.
/* */ var DEBUGGING = this?.DEBUGGING || document?.currentScript?.dataset?.debug;	// you can change this later
} catch {};

const knownNameSpaces =
  { "http://www.w3.org/1999/xhtml":[]		// mainly used for this
  , "http://www.w3.org/2000/svg":[]		// incomplete
  , "http://www.w3.org/1998/Math/MathML":void 0	// not handled for now
  };

/* */ const DispatchEvent = async e => await window.dispatchEvent(e);			// do it asynchronously to not stop execution
/* */ const _FPA = Function.prototype.apply;						// _FPA.call(fn,THIS,[args..])
/*_*/ const _FPC = Function.prototype.call;						// _FPC.call(fn,THIS,args..)
/*_*/ const DONOTHING = function(){}							// The "do nothing" DUMMY function
/* */ const DEPRECATED = (_ => (...a) => { if (_) CONSOLE([_--].concat(a), new Error(`deprecation warning`)) })(100); // prints 100 occurances (hopefully with stacktrace)
/*_*/ const CONSOLE = this.CONSOLE || ((...a) => { console.log(...a) });		// returns void 0 for sure (and changeable)

// mostly sorted by ABC, //^v NAME if NAME is displaced (^v is direction)

/* */ const AsyncFun = Object.getPrototypeOf(async function(){}).constructor;
/* */ const C = (fn,...a) => function (...b) { return _FPC.call(fn,this,...a,...b) }	// Curry (allows to bind this)
/* */ const C$ = (fn,self,...a) => C$$(fn,self,a);					// Curry call (with self)
/* */ const C$$ = (fn,self,a) => (...b) => _FPC.call(fn,self,...a,...b);		// Curry apply (with self)

/* */ const CA = C$$, CC = C$;	// deprecated

// Report some error, but do not terminate execution (just returning VOID)
/* */ const CATCH = function(fn,...a)	{ return CATCH$$(fn,this,a) }	// class { CATCH=CATCH } and then: this.CATCH(this.fn, args..)
/* */ const CATCH$ = (fn,self,...a)	=> CATCH$$(fn,self,a)		// this.fn(args..) becomes CATCH$(this.fn, this, args..)
/* */ const CATCH$$ = (fn,self,a)	=> { try { return _FPC.call(fn,self,...a) } catch (e) { DispatchEvent(new ErrorEvent('esXX_catched_error_event', {error:e})) } }
      //^ CONSOLE

/* */ //const CT = (fn,...a) => CA(fn,this,a)				// instead use: C(this.fn,a) or CC(fn,this)
/* */ const D = (...a) => DEBUGGING ? CONSOLE('DEBUG', ...a) : void 0;
/* */ const DD = (...a) => DEBUGGING ? C(D,...a) : DONOTHING		// log = DD('err in xxx'); log('whatever')

/* */ // mapSet(map,k,v)		map.set(k,v) which returns the value
/* */ // mapDef(map,k,fn,args..)	returns map[k], initialized with fn(args..) if not known already
/* */ const mapSet	= (map,k,v) => (map.set(k,v), v)
/* */ const mapDef	= (map,k,fill,...a) => map.has(k) ? map.get(k) : mapSet(map, k, fill(...a));

      //v defArr
      //^ DEPRECATED
/* */ const DomReady	= new Promise(ok => document.readyState==='loading' ? document.addEventListener('DOMContentLoaded', ok) : ok());
      //^ DONOTHING
      //v E
      //v Fetch FetchProgress fetchProgress
      //v fromJ
      //v Get GetJSON GetText
// //
// for more easy compare: GetKeyCode(event) => {k,m,s} (plus uppercase flags from m/s)
// m: Shift Control Alt Meta
// s: capsLock Numlock sRolllock altGraph	// future: conTextmenu
// Future: .S represents the detected key number (left:1, right:2, and so on)
// But without our own global generic keyboard processor this is not supported by browsers today.
// This sadly also includes things like ContextMenu (X).
const GetKeyCode = e =>
{
  const o = { k:e.code };

  var m='';
  if (e.shiftKey)       { o.S=-1; m += 'S' }
  if (e.ctrlKey)        { o.C=-1; m += 'C' }
  if (e.altKey)         { o.A=-1; m += 'A' }
  if (e.metaKey)        { o.M=-1; m += 'M' }
  o.m   = m;

  var s='';
  if (e.getModifierState('CapsLock'))   { o.L=-1; s += 'L' }
  if (e.getModifierState('NumLock'))    { o.N=-1; s += 'N' }
  if (e.getModifierState('ScrollLock')) { o.R=-1; s += 'R' }
  if (e.getModifierState('AltGraph'))   { o.G=-1; s += 'G' }
  o.s   = s;

  return o;
}
// //e
      //v IGN
/* */ const isArray	= Array.isArray;
/* */ const isFunction	= f => typeof f === 'function';			// https://stackoverflow.com/a/6000009
/* */ const isInt	= i => Number.isInteger(i);
/* */ const isObject	= o => typeof o === 'object' && (Object.getPrototypeOf(o || []) || Object.prototype) === Object.prototype;	// fixed.  Following fails for OB(): https://stackoverflow.com/posts/comments/52802545
/* */ const isObjectOrNull = o => typeof o === 'object' && (Object.getPrototypeOf(o || {}) || Object.prototype) === Object.prototype;
/* */ const isString	= s => s?.constructor === String;		// https://stackoverflow.com/a/63945948
// Relative speeds tested with Chrome 95 in percent:
// 'str' 1 (new String)
// 100 100 100	s?.constructor === String
// 100 100  99	(typeof x == 'string') || (x instanceof String)
//  12  13  11  Object.prototype.toString.call(x) === "[object String]"

/* */ const mkArr = x =>	Array.isArray(x) ? x : [x];			// creates single element array from non-Array datatypes
/* */ const defArr = (x,d) =>	{ x=mkArr(x); return x.length ? x : mkArr(d) }	// same as mkArr, except for [] which becomes default array

// //
// Nonrecursive Array flattening, similar to [].flat(Infinity)
// (I am not convinced, that Array.flat() is nonrecursive!)
//
// ...[..] and recursions are limited, hence we cannot use them.
// for (x of [..]) must visit all [..] to avoid recursion.
// We cannot use .shift() or similar on original arrays.
//
// This has O(n) space complexity and O(n) time complexity:
// - It accesses each element FOUR times, hence O(n):
//   - FIRST to copy it into a local array to operate on
//   - SECOND to shift it out to the local array
//   - THIRD to test it for the type
//   - FOURTH to output the element (if it is not an Array)
// - It iterates on empty arrays or single elements, hence O(ld N)
//   - Only arrays of 2 or more elements do a push onto stack
//   - So we have a maximum of n/2 pushes, which is O(n)
//   - However "foreign" (orig) arrays need to be copied to process them
//   - So in the "already flat" case we have O(n) space need here
function* flattenArray(...a)
{
  for (const stack=a; stack.length; )
    for (let our = stack.pop(); our.length; )
      // stack has only our Arrays, so we can use .shift()
      for (let orig = our.shift();; orig = orig[0])
        {
          if (!isArray(orig))           // orig can be anything, void 0, null, {}, [], etc.
            yield orig;                 // output non-Array element and iterate to next
          else if (orig.length)         // nonempty array?
            {
              if (orig.length===1)      // single element case optimization
                continue;               // loop to orig[0]
              if (our.length)           // recursion needed?
                stack.push(our)         // push what is to do later onto our stack
              our = Array.from(orig);   // iterate on a copy of orig, so we can use .shift()
            }
          break;                        // next iteration
        }
}
// We can avoid the copying by using the original array with an index
// (However index access might be slower than .shift())
function* flattenArrayI(...a)
{
  for (const stack=[[a,0]]; stack.length; )
    for (let [arr,i] = stack.pop(); i<arr.length; )
      for (let orig = arr[i++];; orig = orig[0])
        {
          if (!isArray(orig))           // orig can be anything, void 0, null, {}, [], etc.
            yield orig;                 // output non-Array element and iterate to next
          else if (orig.length)         // nonempty array?
            {
              if (orig.length===1)      // single element case optimization
                continue;               // loop to orig[0]
              if (i<arr.length)         // recursion needed?
                stack.push([arr,i])     // push what is to do later onto our stack
              arr = orig;               // iterate over orig
              i   = 0;
            }
          break;                        // next iteration
        }
}
// //e
// //
// [a,b,c] => {}[fold(a)] = [a]
// also ignores nullish arguments
function FoldArraysIntoObject(fold, ...arrays)
{
  const o = {};
  for (const a of arrays)
    a?.forEach((v,..._) => { const k = fold.call(this,v,..._);  (o[k] || (o[k]=[])).push(v) });
  return o;
}
// //e

/* */ // I hate this.  Why is debugging Promises so hard?  Why isn't it built in?
/* */ // Promise.resolve().then(_ => randomly_failing_function()).then(OK).catch(KO).then(...OKO('mypromise'))
/* */ const KO = (e, ...a) =>	{ D('catch', e, ...a); throw e }	// Promise.reject().catch(KO).then(not_executed)
/* */ const OB = (...a) =>	Object.assign(Object.create(null), ...a); // Plain Object without protoype (just O considered too error prone)
// //
const OBfix = o =>
  {
    let r;
    if (isArray(o))
      r = [];
    else if (isObject(o))
      r = OB();
    else
      return o;
    for (const i in o)
      r[i] = OBfix(o[i]);
    return r;
   };
// //e

/* */ const OK = (v, ...a) =>	{ D('then', v, ...a); return v }	// Promise.resolve().then(OK).then(..)
/* */ const OKO = (...a) =>	[ v => OK(v, ...a), e => KO(e, ...a) ]	// Promise.reject.then(...OKO('mypromise')).then(not_executed)
/* */ const KOK = (...a) =>	DD(...a)				// Promise.reject().catch(KOK('shown when fail&debug')).then(..)
/* */ const IGN = (...a) =>	(...b) => CONSOLE(...a, ...b)		// Promise.reject().catch(IGN('error is ignored')).then(..)

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
/* */ const THROW = e => { e = e instanceof Error ? e : e instanceof ErrorEvent ? new Error(e.message, e.filename, e.lineno, e.colno) : new Error(e); D('ERROR', e); throw e }

      // P(fn, args) is short for: new Promise((ok,ko) => { try { ok(fn(args)) } catch (e) { ko(e) })
/* */ const PO = () => { const o={}; o.p = new Promise((ok,ko) => { o.ok=ok; o.ko=ko }); return o }	// PromiseObject
/* */ const POC = () => { const o = PO(); o.p.catch(IGN); return o }					// PromoseObject with default catch
/* */ const PR = Promise.resolve();			// PRomise
/* */ const PE = Promise.reject();			// PromisErr  WARNING: Only use PE instead of Promise.reject() if you want to suppress the "Uncaught in Promise" error by default!
/* */ PE.catch(DONOTHING);				// shutup "Uncaught in Promise" due to PE
/* */ // Tell error without sideeffects
/* */ // try{..}catch(e){PErr(e)}
/* */ // P.then(..).catch(PErr);
/* */ const PErr = e=>{Promise.reject(e).catch(THROW)};	// unfortunately this does not give us the real error position, only where it is handled, but this is better than nothing
/* */ const P = (fn,...a) => PR.then(() => fn(...a));	// invoke fn(a) in microtask: P(fn,a).then(..).catch(..). See also single_run()
/* */ const P$ = (fn,self,...a) => P$$(fn,self,a);	// invoke fn(a) with this===self
/* */ const P$$ = (fn,self,a) => PR.then(() => _FPA.call(fn, self, a));	// same as P$ but with arguments in array (for optimization)
      //v PostJSON PostText
      //v PutJSON  PutText
/* */ const PC = P$;	// deprecated
// //
// Promise(s) with timeouts
// Resolve all given Promises within the given time
// If one rejects (or timeout) this rejects.
const Ptimeout = (ms, ...prom) =>
  {
    if (prom.length != 1) prom = [Promise.all(prom)];
    const reject = SleEp(ms, 'timeout');
    reject.catch(DONOTHING);
    prom.push(reject)
    return Promise.race(prom);		// Reject after timeout
  };
// //e

/* */ const fromJ	= s => OBfix(JSON.parse(s));	// false === 'constructor' in fromJ('{}')
/* */ const toJ		= o => JSON.stringify(o);
/* */ const sortJ	= (ob,sort,space) => JSON.stringify(ob	// sorted JSON.stringify, see https://stackoverflow.com/a/43636793
/* */  , (k,v) =>
/* */    (v instanceof Object && !(v instanceof Array || v instanceof Date || v instanceof Function))
/* */    ? Object.keys(v).sort(sort).reduce((x,y) => (x[y] = v[y], x), {})
/* */    : v
/* */  , space);

/* */ const SleeP	= (ms,v) => new Promise(ok => setTimeout(ok, ms, v));		// await SleeP(10).then(..)
/* */ const SleEp	= (ms,e) => new Promise((ok,ko) => setTimeout(ko, ms, e));	// await SleEp(10).catch(..)
/* */ const sleepFn	= ms => r => SleeP(ms, r);					// .then(sleepFn(10)).then(..)
/* */ const sleepErr	= ms => e => SleEp(ms, e);					// .catch(sleepErr(10)).catch(..)

// fetch() promises
// p is _ => fetchProgress(_, ..) from below, use like:
// Get(URL, _ => fetchProgress(_, fn, args..))
/* */ const Fetch	= (u,o,p) => fetch(u,o).then(p || (_=>_)).then(r => r.ok ? r : Promise.reject(`${r.status}: ${r.url}`))
/* */ const Get	= (u,p) => Fetch(u, { cache:'no-cache' }, p)
/* */ const GetC	= (u,p) => Fetch(u, { cache:'no-cache', credentials:'include' }, p)
/* */ const _MTFUD	= (m,t,f) => (u,d,p) => Fetch(u, { cache:'no-cache', method:m, headers:{'Content-Type':t}, body:f ? f(d) : d }, p)
/* */ const PostText	= _MTFUD('POST', 'text/plain')
/* */ const PutText	= _MTFUD('PUT', 'text/plain')
/* */ const _MUJ	= m => _MTFUD(m, 'application/json', JSON.stringify)
/* */ const PostJSON	= _MUJ('POST')
/* */ const PutJSON	= _MUJ('PUT')

/* */ const _Json	= p => p.then(r => r.status==200 ? r.json() : THROW(r.status))
/* */ const _Text	= p => p.then(r => r.status==200 ? r.text() : THROW(r.status))
/* */ const GetText	= (u,p) => _Text(Get(u,p))
/* */ const GetTextC	= (u,p) => _Text(GetC(u,p))
/* */ const GetJSON	= (u,p) => _Json(Get(u,p))

// Why isn't something similar already in the spec as an option?
//
// Fetch('url').then(     fetch_progress  (callback, ...args)).then(_ => _.text())	// syntactic Sugar
// Fetch('url').then(_ => FetchProgress(_, callback, ...args)).then(_ => _.text())
//
// Calls callback(...args, pos, total, original_response) with this==original_response
// total is void 0 (AKA: undefined) if Content-Length header missing
// original-response is the _ above, also passed as this
//
// Why is it so complex to make it somewhat efficient?
// Following looks a bit too much like Java for my taste .. sorry:
// https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#reading_the_stream
//F//
const fetch_progress = (...a) => _ => FetchProgress(_, ...a)
const FetchProgress = (_, fn, ...args) =>
  {
    const reader = _.body.getReader();
    const cl     = _.headers.get('content-length');
    const total  = cl === void 0 ? cl : (cl|0);

    let pos = 0;
    const start = controller =>
      {
        return pump();
        function pump()
          {
            _FPC.call(fn, _, ...args, pos, total, _);
            return reader.read().then(chunk =>
              {
                if (chunk.done)
                  {
                    controller.close();
                    return;
                  }
                pos += chunk.value.length;
                controller.enqueue(chunk.value);		// this can be quite big, right?
                return pump();
              });
          }
      };
    return new Response(new ReadableStream({start}), _);
  };
//F//e

     //^ THROW

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

const decodeHTML = _ => { const t=document.createElement('textarea'); t.innerHTML = _; return t.value }
const encodeHTML = _ => { const t=document.createElement('textarea'); t.innerText = _; return t.innerHTML.replace('"', '&quot;') }

const strsplice = (s,from,to,replace) => `${s.substring(0,from)}${replace}${s.substring(to)}`;

// choices([1,2,3])		=> [[1],[2],[1,2],[3],[2,3],[1,3],[1,2,3]]
// choices([1,2,3],2)		=> [[1,2],[1,3],[2,3],[1,2,3]]
// choices([1,2,3],2,2)		=> [[1,2],[1,3],[2,3]]
// with generators min and max are probably needed (as we do not know how long the generator is)
// Array.from(choices(...)) to get it as Array
const choices = function*(gen,min,max)
{
  min |= 0;
  max |= 0;
  if (max && max < min) max = min;
  max--;
  min--;

  const was = [];
  for (const x of gen)
    {
      if (was.length >= min)
        for (const t of choice(was, []))
          yield t.concat([x]);
      was.push(x);
    }

  function* choice(arr, r, ign)
    {
      if (r.length >= min && !ign)
        yield r;
      if ((max<0 || r.length < max) && arr.length)
        {
          const a = arr.slice();
          const e = a.shift();
          yield* choice(a, r.slice(), 1);
          r.push(e);
          yield* choice(a, r.slice());
        }
    }
}

// perms([1,2,3])		=> [[1,2,3],[1,3,2],[3,1,2],[2,1,3],[2,3,1],[3,2,1]]
// perms([1,2],1)		=> [[1],[1,2],[2],[2,1]]
// perms([1,2],0)		=> [[1],[1,2],[2],[2,1]]
// with generators min and max are probably needed (as we do not know how long the generator is)
// Array.from(perms(...)) to get it as Array
const perms = function*(gen,min,max)
{
  min ??= gen.length;
  min |= 0;
  max |= 0;
  if (max && max < min) max = min;
  min--;
  max--;

  const was = [];
  for (const x of gen)
    {
      if (was.length >= min)
        for (const t of perm(was, []))
          for (let i=max>=0 && max<t.length ? max : t.length; i>=0; i--)
            {
              const r = t.slice();
              r.splice(i,0,x);
              yield r;
            }
      was.push(x);
    }
  function* perm(arr, r)
    {
      if (r.length >= min)
        yield r;
      if (max<0 || r.length < max)
        for (let i=0; i<arr.length; i++)
          {
            const a = arr.slice();
            yield* perm(a, r.concat(a.splice(i, 1)));
          }
    }
}

// alts([[a,b],[c,d]])		=> [[a,c],[a,d],[b,c],[b,d]]
// alts([[[1,2],3],[a,[b,c]]])	=> [[1,2,a],[1,2,b,c],[3,a],[3,b,c]]
// first argument can be Array or generator
// Array.from(alts(...)) to get it as Array
const alts = function*(gen)
{
  const had = {};
  for (const x of gen)
    yield* alt(x, []);

  function* alt(arr, r)
    {
      while (arr.length)
        {
          const e = arr.shift();
          if (Array.isArray(e))
            {
              for (const x of e)
                yield* alt(arr.slice(), r.concat(x));	// not .concat([x]), so array elements can insert more than 1 element
              return;
            }
          r.push(e);
        }
      yield r;
    }
}

// (ES11->ES13: I am not sure if and how Babel handles this correctly, so I keep it as-is for now.)
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
        __o
        constructor(o) { this.__o = o }
        deref() { return this.__o }
        }
    }
  })();

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// OVERVIEW: (sync:immediately, async:microtask, cycle:task queue, frame:animation frame)
//
// r=tmpcache(fn,a..):		sync: r(b) caches fn(a), but only in this cycle
// r=single_run(fn,a..):	async: r(b) runs fn(a,b) if it not already runs, else re-runs last invocation when fn(a,b) finishes
// r=once_per_cycle(fn,a..):	cycle: r(b) runs fn(a,b) once on end of cycle. r(b) returns unused arguments (previous invocation not realized)
// r=once_per_frame(fn,a..):	frame: as once_per_cycle() but on animation frame.
// r=once_per_ms(ms,fn,a..):	delay: as once_per_cycle() but last invocation after given ms
// note: once_per_cycle(fn,a..) is the same as once_per_ms(0,fn,a..)
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
          if (ret.has(this))
            return ret.get(this);		// cached value
        }
      else
        {
          ret	= new WeakMap();		// temporary cache
          setTimeout(() => ret = void 0);	// expire at next loop
        }
      ret.set(this, void 0);			// avoid recursion
      const v = fn.apply(this, a);
      ret.set(this, v);				// cache real value (from this cycle)
      return v;
    }
};

// gather function calls to execute at the end of the current cycle.
// function calls are remembered based on the first argument only.
// This differentiates by 'this', so can initialize methods.
// class X { thing = gather(function (args) { ... }) };
// x = new X();
// x.thing('a');
// x.thing('b');
// x.thing('a');
// // on the next cycle fn('a') and fn('b') are called, nothing else
const gather = fn =>
  {
    let map;
    const run = () =>
      {
        const r	= map;
        map	= void 0;
        r.forEach((_,t) => _.forEach(a => fn.apply(t,a)));	// crash early on bugs
      };
    return function (...a)
      {
        if (!map)
          {
            map	= new Map();
            setTimeout(run);					// run after this cycle
          }
        mapDef(map, this, () => new Map()).set(a[0], a);	// remember last added key only
      }
  };

class Cancelled
  {
  __a
  constructor(...a) { this.__a = a }
  get $cancelled() { return this.__a }
  get cancelled() { DEPRECATED('please use .$cancelled'); return this.__a }
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
//           err => err.$cancelled ? was_cancelled(err) : other_error(err)
//          )
//
// - single_run(fn,a) returns a function (here called r)
//   In future this might change to a callable class which encapsulates it all.
// - r(b) returns a Promise which resolves to the return value (or error) of fn(a,b)
// - Until this Promise is resolved, further calls to r(x) are delayed until the Promise resolves
// - If another r(y) arrives while r(x) is waiting, r(x) is rejected with the Cancelled() class (which does not derive from Error by purpose).
//   r(y) replaces r(x) this way
// - On Cancelled() the .$cancelled property returns the (truthy) array of the given arguments which replaced the r(x) (the [a,y])
//   Hence you can test with something like .catch(e => { if (e.$cancelled) ..
//   This also works with try { await r(y) } catch (e)  { if (e.$cancelled) ..
// - (single_run(fn,a..).cancelfn(cfn,c..))(b..) is the same as single_run(fn,a..)(b..), but sets cfn as function on cancel.
//   If cfn === false, it mutes/disables/ignores Cancelled exceptions and returns b[0] (undefined by default).
//   If cfn is not given (falsish), the newly created Promise (for the new call) is returned (to the old call), so this follows/waits for the new call.
//   If cfn === true, the original behavior is restored.
//   Else cfn is invoked as cfn(...c,a,b) on cancel.
//   Rationale: If there is a function, give it.
//   cancelfn(true) means "yes, do the cancel thing"
//   cancelfn(false) kicks the cancel thing, returning void 0
//   cancelfn(false, 1) returns the given value (you need to write something before the value)
//   cancelfn() does not cancel, instead, it returns the latest promise
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
    const def = (was,a,b) => was[3](new Cancelled(a,b));
    let cancel = def;
    const r = (...b) =>
      {
        const was = invoke;
        const p = new Promise((ok, ko) =>
          {
            //D('SR', 'exec', fn, a, invoke);
            invoke = [a,b,ok,ko];
            if (!running)
              loop();
          });
        if (was)
          cancel(was,a,b,p);
        return p;
      };
    function cancelfn(fn,...c)
      {
        cancel = fn
          ? fn===true  ? def : (was,a,b) => was[2](P(fn,...c,a,b))
          : fn===false ? was => was[2](c[0]) : (was,a,b,p) => was[2](p);
        return this;
      }
    r.cancelfn = cancelfn;
    return r;
  };

// Wrap a functioncall such, that it is only called once in a cycle or frame:
// (For synchronous functions only.  For ASYNC functions see single_run)
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
        const call = () => { if (block!==done && x) { done=block; const t=x; x=void 0; fn(...a,...t) } }; // run if semaphore changed
        if (block)
          throw new Exception('_run_once() called from within function executing once per cycle');
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
const once_per_cycle	= _run_once(_ => setTimeout(_));
const once_per_frame	= _run_once(_ => window.requestAnimationFrame(_));
const once_per_ms	= (ms,...a) => _run_once(_ => setTimeout(_,ms))(...a);
const once_per_ms$	= (fn,...a) => _run_once(_ => setTimeout(_,fn(...a)))(...a);

// *UNTESTED*
// Revocable Promise:		// at least what I came up with
// r = R(fn, ...args);		// fn(r,...args) is called and should return a Promise
// .signal			// AbortController.signal
// .abort			// AbortController.abort (result is that of what the function returns due to the abort)
// .aborted			// AbortController.signal.aborted
// .settled			// true if Promise has resolved
// .onabort			// AbortController.signal.onabort
// .on(fn, ...args)		// AbortController.signal.addEventListener(() => fn(...args)).  Returns function which, wenn called, removes the listener
// .revoke(cause)		// AbortController.abort() plus reject Promise with given cause instead.
// .then() .catch() .finally()	// same as for Promise
// .ok(_)			// accept Promise, WITHOUT revocation
// .ko(_)			// reject Promise, WITHOUT revocation
// Syntactic sugar:		// .revoke=cause, .ok=_, .ko=_
class Revocable extends Promise
  {
    constructor(fn,...a)
      {
        const __	= { a:new AbortController() };
        const sig	= __.a.signal;
        super((ok,ko) => { __.o = ok; __.k = ko });
        const kick = x => _ => { if (__) { __ = void 0; x(_) } };
        const ok = _ => kick(__.o)(_);
        const ko = _ => kick(__.k)(_);
        (async () => fn(this,...a))().then(kick(__.o), kick(__.k));
        Object.defineProperty(this, 'ok',	{ get:() => _ => ok(_),            set: ok });
        Object.defineProperty(this, 'ko',	{ get:() => _ => ko(_),            set: ko });
        Object.defineProperty(this, 'signal',	{ get:() => __.a.signal });
        Object.defineProperty(this, 'abort',	{ get:() => __.a.abort() });
        Object.defineProperty(this, 'revoke',	{ get:() => _ => this.revoke = _,  set: _ => { __.a.abort(); ko(_) } });
        Object.defineProperty(this, 'onabort',	{ get:() => sig.onabort,           set: _ => sig.onabort = _ });
        Object.defineProperty(this, 'aborted',	{ get:() => sig.aborted });
        Object.defineProperty(this, 'on',	{ get:() => (fn,...a) => { const f = _ => fn(...a); sig.addEventListener('abort', f); return () => sig.removeEventListener('abort', f) } });
        Object.defineProperty(this, 'settled',	{ get:() => !__ });
      }
  };
const R = (...a) => new Revocable(...a);

// Examples:
// for (let i=0; ++i<1000000; ) fetch(`http://example.com/?${i}`);	// crashes the Tab
// const fetch50 = Semaphore(50, fetch);				// repair
// for (let i=0; ++i<1000000; ) fetch50(`http://example.com/?${i}`);	// works
/*
  const x = Semaphore(
        _ => { console.log('running', _.run); return 10 },
        (v,ms) => new Promise(ok => setTimeout(ok, ms, {v, ms})).then(_ => console.log('resolved', _)),
        'waiting was'
        );
 for (let i=100; --i>0; x(Math.random()*10000|0));
*/
/*
  const sem = Semaphore(1);

  async function task(s)
    {
      console.log('task', s);
      const release = await sem.Acquire(1);
      console.log(1, s);
      await SleeP(2500);
      console.log(2, s);
      release();
      return s;
    }

  task('hello').then(console.log);
  task('world').then(console.log);
  console.log('main');
*/
// Semaphore() returns with following properties:
// .max		parameter 1  passed to Semaphore (your chosen max value or function).
// .fn		parameter 2  passed to Semaphore (the function protected by Semaphore)
// .args	parameter 3+ passed to Semaphore (the first arguments to .fn)
// .count	number of currently running calls
// .wait	number of currently waiting calls
// .cancel(..)	cancels all waiting calls (this rejects their promise!)
// .stop()	stops further execution
// .start()	starts execution again
//
// .max, .fn and .args can be changed on the fly!
// If .fn is NULL, a call to the return of Semaphore just resolves to the array of given parameters.
//
// .cancel .stop .start are chainable (return the Semaphore)
// .cancel(N,M)	cancels waiting tasks with message M.  By default this is the array of the second arguments passed to fn.
// .cancel()	cancels all
// .cancel(+N)	cancels the first N on the waiting list
// .cancel(-N)	cancels the last  N on the waiting list
// .try()	Same as Acquire(), but synchronous.  Hence it fails if no Semaphore available (or .max is a function which returns a Promise or throws)
// .acquire()	same as .try().  Note that .try() returns void 0 if nothing can be aquired
// .Acquire()	acquires 1.  returns a Promise which resolves to the "release()" function.
// .Acquire(0)	acquires all free (at least 1).
// .Acquire(N,..) and .acquire(N,..) call .max(N,..) if .max is a function
//		release() or release(void 0) releases all Acquired, release(1) only releases 1.  Throws if "overreleased"
// .Idle()	same as .Max()
// .free(N)	returns the number of currently free slots (==N if N given).  0 if nothing is free (or N cannot be satisfied).  Throws if unsatisfyable
// .Free(N)	same as .free() but asynchronous. .Free()/.free() work like .Acquire()/.acquire(), but does not return a release() function
// .WaitN(N)	wait for N Releases. .WaitN(0) returns immediately if nothing is running, else waits for 1 Release
// .Max(N)	wait until .count is not more than N, .Max() is .Max(0)
// .Min(N)	wait until .count is at least N, .Min() is .Min(0)
//		Min(0) waits until something happens on the Semaphore
//		Min(-1) waits until a Release or Acquire
//		Min(-2) waits until an Acquire
// .Waiting(N)	wait until .wait <= N
//
// .fifo()	switches in FiFo-queuing-strategy (first in, first out), default
// .lifo()	switches in LiFo-queuing-strategy (last in, first out)
//
// If .max is a function, it is called with the Semaphore (and optional .Acquire() args) can dynamically return how much work to do in parallel.
// If it returns a Promise, execution halts until the Promise resolves.  If it rejects or .max() throws, this is as if it returns 1
// .max() is always called when something happens on the Semaphore (work added, finished, etc.), so it can be used to implement progress monitoring.
//
// JS has no support to abort async functions, hence there is no way to cancel running functions (yet).
// If someone comes up with a good idea on how to cancel async functions, it should be implemented, too.
const Semaphore = (max, fn, ...args) =>
  {
    const D = DD('Semaphore');
    let run = 0;
    let maxing;		// set while run.max() is awaited
    let waiting, cntwait;
    const waits = [];
    const upd = n =>
      {
        n		= n|0;
        ret.count	= run += n;
        ret.wait	= waits.length + (waiting?.count|0);
        if (n<0 && waiting)
          {
            const ok	= waiting.ok;
            waiting	= void 0;
            ok(n);		// reenable all waiting .Acquires
          }
        if (cntwait)
          {
            const ok	= cntwait.ok;
            cntwait	= void 0;
            ok(n);
          }
      }
    const check = _ =>
      {
        D('check', _);
        maxing = void 0;
        _ = _|0;
        if ((_<=0 || run<_) && waits.length)
          {
            const x	= waits.shift();
            upd(1);
            x[0](x[2]);
          }
      }
    // XXX TODO XXX
    // We should call .max() only once (with the same parameters)
    // and cache the result until something changes on the Semaphore.
    // This also could improve the non-async case in case the async part already has finished.
    // (But this perhaps creates some nondeterministic looking behavior on the non-async calls.)
    // !! Be prepared that .max() function is only called on changes in future !!
    const get = (...a) =>
      {
        D('get', a);
        upd();
        try {
          return isFunction(ret.max) ? ret.max(ret, ...a) : ret.max;
        } catch (e) {
          return PE;	// This is an internal function, so do not call global error handler in case we are rejected
        }
      }
    const next = _ =>
      {
        D('next', _);
        if (maxing) return upd();
        const limit = get();
        if (limit?.then)
          maxing = Promise.resolve(limit).then(check, _=>check(1));	// in case of max() failing, we just ensure one semaphore runs so this is called again
        else
          check(limit);
        return _;
      }
    const cancel = (n,msg) =>
      {
        let _;
        if (n === void 0) n	= waits.length;
        for (n = n|0; n<0 && (_ = waits.pop())  ; n++) _[1](msg || _[2]);	// fail promise with msg
        for (       ; n>0 && (_ = waits.shift()); n--) _[1](msg || _[2]);	// _[1] is ko callback
        if (waiting) waiting.ko(msg);		// we cannot cancel N here, just all which wait for .Aquire()
        return ret;
      }
    const release_function = n =>
      {
        // release.left count left
        // release.release is the same function such that you can do sem.Acquire(1).then(_ => _.run(fn, ...).release());
        // release() releases all
        // release(0) does nothing (except updating properties)
        function release(k)
          {
            D('release', k);
            if (k===void 0 && !(k=n)) THROW(`Semaphore.release(): already fully released`);
            k = k|0;
            if (k<0) THROW(`Semaphore.release(${k}): negative`);
            if (n<k) THROW(`Semaphore.release(${k}): too high (max ${n})`);
            release.left	= n -= k;
            upd(-k);
            return release;
          }

        upd(n);

        release.release = release;
        release.run = (fn, ...args) => { CATCH$$(fn, release(0), args); return release(0) }
        return release(0);
      }
    const free = (N,...a) =>		// .free('1') works.  .free('0') throws!  This is intended
      {
        D('try', N,a);
//        if (maxing) return;		// max is already resolving -> nope, perhaps max() behaves differently here
        let n = N === void 0 ? 1 : N|0;	// This works for classes with toString() returning nonnull integer
        if (!n && N!==0)		THROW(`Semaphore: nonnumeric paramter ${N}`);
        if (n<0)			THROW(`Semaphore: negative parameter ${n}`);

        let limit = get(N,...a);	// passing N, not n
        if (limit?.then)		THROW(`Semaphore: cannot use async .max() in non-async call`);
        limit = limit|0;

        if (!n)
          {
            if (limit<=0)		THROW(`Semaphore: unlimited (.max is ${limit})`);
            n	= limit-run;
            if (n<1) return 0;		// Nothing free
          }
        else if (limit>0)
          {
            if (n>limit)		THROW(`Semaphore: unsatisfyable ${n} (.max is ${limit})`);
            if (run+n>limit) return 0;	// Not enough free
          }
        return n;
      }
    const acquire = (...a) => { const n = free(...a); return n ? release_function(n) : void 0 }

    const Waiting = async N =>
      {
        N = N|0;
        while (ret.wait>N)
          {
            if (!cntwait)
              cntwait	= PO();
            await cntwait.p;
          }
        return ret;
      }
    const Max = async N =>
      {
        N = N|0;
        while (ret.count>N)
          {
            if (!cntwait)
              cntwait	= PO();
            await cntwait.p;
          }
        return ret;
      }
    const Min = async N =>
      {
        N = N|0;
        if (N<=0 || ret.count<N)
          do
            {
              if (!cntwait)
                cntwait	= PO();
              const n = await cntwait.p;
              if (N<0 && !n || N<-1 && n<0)
                continue;
            } while (ret.count<N);
        return ret;
      }
    const WaitN = async N =>
      {
        N = N|0;
        if (N<=0 && !ret.count) return ret;
        do
          {
            if (!waiting)
              waiting = PO();
            if ((await waiting.p)>=0)
              continue;
          } while (--N>0);
        return ret;
      }

    // Sadly I found no good way to reuse things (.free) here
    // XXX TODO XXX implement with Revocable above!
    const Free = async (N,...a) =>
      {
        D('Free', N,a);
        let n = N === void 0 ? 1 : N|0;		// This works for classes with toString() returning nonnull integer
        if (!n && N!==0)		THROW(`Semaphore: nonnumeric paramter ${N}`);
        if (n<0)			THROW(`Semaphore: negative parameter ${n}`);

        for (;;)
          {
            const limit = (await get(N,...a))|0;	// passing N, not n
            if (!n && limit<=0)		THROW(`Semaphore: unlimited (.max is ${limit})`);
            if ( n && limit< n)		THROW(`Semaphore: unsatisfyable ${n} (.max is ${limit})`);

            if (run < limit && run+n <= limit)
              return n ? n : limit-run;

            if (!waiting)
              waiting = PO();
            waiting.count = (waiting.count|0) + 1;	// Either .Acquire() or .Free() are waiting, too, so increase .wait()
            upd();
            D('Free', 'wait');
            await waiting.p;
            D('Free', 'cont');
          }
      }
    const Acquire = async (...a) => release_function(await Free(...a));

    let discipline = 'push';

    const ret = (..._) => next(new Promise((ok,ko) => waits[discipline]([ok,ko,_])).then(() => (ret.fn ? ret.fn : (...a)=>a)(...ret.args,..._), _ => { run++; throw _ }).finally(() => next(upd(-1))));
    ret.lifo	= () => { discipline='unshift'; return ret; };
    ret.fifo	= () => { discipline='push'; return ret; };
    ret.max	= max;
    ret.fn	= fn;
    ret.args	= args;
    ret.cancel	= cancel;
    ret.stop	= () => { maxing = true; return ret };
    ret.start	= () => { if (maxing===true) maxing=false; return next(ret) }
    ret.try	= acquire;
    ret.acquire	= acquire;
    ret.Acquire	= Acquire;
    ret.free	= free;
    ret.Free	= Free;
    ret.Max	= Max;		// wait for max running
    ret.Idle	= Max;		// wait for Semaphore being idle, convenience
    ret.Min	= Min;		// wait for N started
    ret.WaitN	= WaitN;	// wait for N releases
    ret.Wait	= _ => { console.debug('Semaphore.Wait() deprecated, use Semaphore.WaitN()'); return WaitN(_) }
    ret.Waiting	= Waiting;	// wait until N or less are waiting
//    ret.release	= release;	// I really have no good idea how to implement this the sane way in an async world
// XXX TODO XXX await sem.Aquire(2) /* not saving return */; ..; sem.release(1); ..; sem.release(1); ..; sem.release(1) ==> throws
// XXX TODO XXX .abort() to abort running Promises (if there is some clever way)
    return ret;
  }

// ON-Event class (in the capture phase by default)
// If the handling returns trueish, processing of the event stops (this is the exact opposite of old DOM AND include additional handlers).
// `this` is set to the ON-instance within the function (if not bound elsewhere)
// calls fn(event, ...a)	for: ON('event').add(fn, ...a).attach(E(element))
// calls fn(event, elem, ...a)	for: elem = E(element).on(fn, ...a)
// Use this.detach() to remove the error handler again, no error prone bookkeeping required
class ON
  {
  __type; __capture; __el; __fn

  constructor(type, capture=true)
    {
      this.__type	= type.split(' ');
      this.__capture	= capture;
      this.__el		= [];
      this.__fn		= [];
    }

  CATCH = CATCH		// trick to set this on call
  add(fn, ...a)		{ return this.add$$(fn,a) }					// fn(ev,...a) with this set
  add2(fn, ...a)	{ return this.add$$(function (...a) { fn(this,...a) }, a) }	// fn(ev,this,...a) without this set
  add$$(fn, a)		{ this.__fn.push([fn,a]); return this }
//remove(fn, ...a)	{ this.__fn.remove([fn,a]); return this }	does not work this way

  handleEvent(ev)
    {
//      CONSOLE('handle', this.__type);
      this.$ = ev;
      for (const a of this.__fn)
        if (this.CATCH(a[0], ev, ...a[1]))	// do not bail out on error, just report
          {
//            CONSOLE('prevent', this.__type);
            ev.stopPropagation();
            ev.preventDefault();
            ev.stopImmediatePropagation();
            return false;
          }
      return true;
    }

  attach(...a)
    {
      for (const o of a)
        for (const e of o)
          {
            for (const t of this.__type)
              e.addEventListener(t, this, this.__capture);
            this.__el.push(new es11WeakRef(e));
          }
      return this;
    }

  detach()
    {
      const l=this.__el;
      this.__el=[];
      for (const a of l)
        {
          const o=a.deref();
          if (o)
            for (const t of this.__type)
              o.removeEventListener(t, this, this.__capture);
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
          return ob.$.style[prop];
          // Note that (perhaps next needs receiver = ob.$.style, but it works in Chrome!):
          // return Reflect.get(ob.$.style, prop, receiver); fails on FF with
          // Uncaught TypeError: 'get alignContent' called on an object that does not implement interface CSS2Properties.
          // Following got only 3 hits (one of them just an translated page):
          // https://www.google.com/search?q=%22called+on+an+object+that+does+not+implement+interface+CSS2Properties%22
          // see also https://stackoverflow.com/a/78746758/490291
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
    overflowWrap:		3,
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
// I learned that CSP forbids `super('string')`, too.  Hence this is unusable.
/*
class Callable_ extends Function
  {
  constructor()
    {
      // Also we cannot use super():
      // DOES NOT WORK: super('...args', 'return this._bound._call(...args)');
      //	this._bound = this.bind(this);
      //	return this._bound;
      // Proxy() cannot be used, as it requires super() which is blocked, too.
      // DOES NOT WORK as we need to call super() before using Proxy like this:
      //	return new Proxy(this, { apply: (t,s,a) => t._call(...a)});	// I don't like it anyway
      const fn = function(...a) { return fn._call(...a) }
      return Object.setPrototypeOf(fn, new.target.prototype);	// SLOW AS HELL
    }
  // _call(...a) { .. } must be implemented in subclass
  };

// Too ugly to rewrite name_ to name
class Callable_ extends Callable
  {
  constructor()
    {
      super();
      Object.defineProperty(this,'name',{writable:true, value:this.name_});
    }
  // use name_ instead of name
  // _call(...a) { .. } must be implemented in subclass
  };
*/
// Better approach:
// Manually create the class and explicitly take over the `name` property
// (and in future perhaps others), which is ugly as well, but much more convenient:
function Callable()	// typeof Callable === 'function'
{
  const fn = function(...a) { return fn._call(...a) }
  const self = Object.setPrototypeOf(fn, this.constructor.prototype);	// SLOW AS HELL
  Object.defineProperty(fn,'name',{writable:true,value:this.name});	// hack to take over name and make it writable
  return self;
}
Callable.prototype = Object.create(Function.prototype);
// console.log('Callable:', typeof Callable); // => 'function' as wanted!

// returns:
// - the call to a function, if it is callable.
// - the element, if it is an element _E0 and has no args (else it calls the element!)
// - else the first argument (possibly ignoring others)
// BUGS:
// - should be able to add more exclusions like _E0 here
// - in the degenerated case when a.length>0 it should return an array from all args, instead instead of ignoring ...a
const CALL	= (fn, ...a) =>	!fn || !fn.call || (fn instanceof _E0 && !a.length) ? fn : fn.call(this,...a);
const Call	= async (...a) => { const c = []; for (const _ of a) c.push(await a); return _CALL(...c) }	// async CALL awaiting args

// This is an element wrapper (not really like jQuery).
// const input = E().DIV.text('hello world ').INPUT;
class _E0 extends Callable
  {
  // when renaming __E, do not miss reference in definition of 'const E' below!
  __e; __E = [];	// __e === __E[0] unless __e is FRAGMENT, then __E == []
  __d;			// Additional Userdata
  CATCH = CATCH		// trick to set this on call

  constructor(e)	{ super(); this.__e = (this.__E = e ? mkArr(e) : [])[0] || FRAGMENT() }
  get $()		{ return this.__e; }
  get $all()		{ return this.__E; }		// Symbol.iterator also works for FRAGMENT() case
  all(fn, ...a)		{ for (const _ of this) fn(_, ...a); return this }
  allev(ev,...a)	{ return this.all(...a).mkev(ev) }
  // gather all events within a cycle
  // events are only dispatched to the first element for efficiency reason
  mkev(_)		{ _.split(' ').forEach(_ => _ && this._mkev(_)); return this }
  _mkev = gather(function (_)
    {
      this.$.dispatchEvent(new CustomEvent(`_${_}`, { detail:this }));
    });

  CHAIN(...a)		{ return E0(CALL(...a)) }		// can return void 0
  chain(...a)		{ return this.CHAIN(...a) || this }	// WARNING: this can be modified with a function!
  // chain(fn, args..) is like run(fn, args) but also allows chain(E()) or chain() or something like that
  async Chain(...a)	{ return E0(await Call(...a)) }		// async variant

  get $data()		{ return this.__d || (this.__d = {}); }
  data(x,y)		{ this.$data[x]=y; return this }

  RM(...a)		{ const x = this.CHAIN(...a); for (const e of this.__E) e.remove(); return x }
  rm(...a)		{ this.RM(...a); return this }
  remove()		{ return this.rm() }

  // Note that the handler must return truish to stop the handling of the event.
  // This is not only kind opposite of what DOM did, it also stops handling of all other event handlers added to the ON class.
  // (There ususally is only one, except when you use .ON().add())
  ON(type, fn, ...a)	{ return type ? new ON(type).add(fn, this, ...a).attach(this) : void 0 }
  on(...a)		{ this.ON(...a); return this }
  // onme() and ONme() only fire on the original elements it was directly attached to and not for any children
  ONme(type, fn, ...a)	{ return this.ON(type, _ => this.__E.includes(_.target) ? fn(_, this, ...a) : void 0) }
  onme(...a)		{ this.ONme(...a); return this }
  // onb() and ONb use Bubbling phase, so are on reverse order
  ONb(type, fn, ...a)	{ return type ? new ON(type, false).add(fn, this, ...a).attach(this) : void 0 }
  onb(...a)		{ this.ONb(...a); return this }
  // onkey('keydown', { '_Enter _NumpadEnter':function (ev,el,k,...args) { return true } }, args..)
  // fn() returns truish: Event swallowed
  // fn() throws: handler is removed
  // Sequence of function calls: s_m_k then m_k then k
  onkey(type,o,...a)
    {
      const on = new ON(type).add((ev,...b) =>
        {
          const k = GetKeyCode(ev);
          console.log('onkey', type, k, b);
          return check(ev,k, `${k.s}_${k.m}_${k.k}`) || check(ev,k, `${k.m}_${k.k}`) || check(ev,k, `${k.k}`);
        }).attach(this);
      const check = (_,k,i) =>
        {
          try {
            const fn = c[i];
            if (fn) return fn(_,this,k,...a);
          } catch (e) {
            delete c[i];
            if (!Object.keys(c).length)
              on.detach();
          }
        }
      const c = {};
      for (const [k,v] of Object.entries(o)) for (const s of k.split(' ')) if (s!=='') c[s]=v;
      return this;
    };

  // The 2nd case can only happen on FRAGMENT()s like E() or E.DIV in which case .$all does not work
  *[Symbol.iterator]()	{ if (this.__E.length) yield* this.__E; else if (this.__e) yield* Array.from(this.__e.childNodes) }
  *MAP(fn, ...a)	{ for (const e of this) yield fn(e, ...a) }
  //forEach(...a)	{ return this.run(...a) }	// made no sense!
  foreach(fn,self)	{ this.__E.forEach((e,i) => fn.call(self, E(e), i, this)); return this }

  Run(fn, ...a)		{ return P(fn, this, ...a) }
  Run$(fn, ...a)	{ return P$$(fn, this, a) }
  Run$$(fn,a)		{ return P$$(fn, this, a) }
  // ..run(_ =>             _.DIV.DIV.text('HW'))     ..
  // ..run$(function() { this.DIV.DIV.text('HW') })   ..
  // ..                       DIV.DIV.text('HW').$$.$$..	// place the right number of $$ here
  run(fn, ...a)		{ fn(this, ...a); return this }
  run$(fn, ...a)	{ fn.apply(this, a); return this }
  run$$(fn,a)		{ fn.apply(this, a); return this }
  // variants not returning this, but instead return the return value of the function
  // fn(_,..).then( can be written as  _.RUN(fn,..).then(
  // which keeps the function call in a chain where it is done (and does not drive indent to the right)
  RUN(fn, ...a)		{ return fn(this, ...a) }
  RUN$(fn, ...a)	{ return fn.apply(this, a) }
  RUN$$(fn,a)		{ return fn.apply(this, a) }
  // like run() but async
  async Await(fn,...a)	{ await fn(this,...a); return this }
  async Await$(fn,...a)	{ await fn.apply(this, a); return this }
  async Await$$(fn,a)	{ await fn.apply(this, a); return this }

  debug(...a)		{ console.log('debug', ...a, this.__E); return this }

  // FNs are expected to return some E() or void 0.
  // If they return a different truish, this is returned unchanged, so your code may break!
  // if(bool,fn,args..) returns 'this', if bool or fn()'s return is falsish, else returns fn(this,args..)
  // If(bool,fn,args..) ditto, but async
  // iF(bool,fn,args..) returns bool && fn(this,args..)
  // IF(bool,fn,args..) ditto, but async
  // Sample use to suppress output of ${dump(usr)} if !usr:
  // const usr = this.getUser();
  // // in the first 3, usr -----vvv is a bit redundant ----------------vvv
  // E('out').clr().text('H').if(usr, (_,u) =>       _.text(dump(u))  , usr).text('W');	// H${dump(usr)})W
  // E('out').clr().text('H').if(usr, (_,u) =>   _.DIV.text(dump(u))  , usr).text('W');	// H<div>${dump(usr)}</div>W
  // E('out').clr().text('H').if(usr, (_,u) => { _.DIV.text(dump(u)) }, usr).text('W');	// HW<div>${dump(usr)}</div>
  // E('out').clr().text('H').cond(   (_,u) => { _.DIV.text(dump(u)) }, usr).text('W');	// HW<div>${dump(usr)}</div>
  // E('out').clr().text('H').run(    (_,u) => u?_.DIV.text(dump(u)):0, usr).text('W');	// HW<div>${dump(usr)}</div>
  // // In the last two you can put this.getUser() there directly ------^^^, the last is a bit less readable
  if(...a)		{ return       this.iF(...a) || this }	// returns this as default
  async If(...a)	{ return await this.iF(...a) || this }	// async .if()
  iF(bool,fn,...a)	{ return bool && fn(this,...a) }	// return bool if falsish else run fn and returns it's value
  async IF(...a)	{ return await this.iF(...a) || this }	// returns async this as default
  // .If(true,fn,...a) is a redundant form of .Run(fn,...a)

  // same as before but with this as this instead of first value
  if$(...a)		{ return       this.iF$(...a) || this }	// returns this as default
  async If$(...a)	{ return await this.iF$(...a) || this }	// async .if$()
  iF$(bool,fn,...a)	{ return bool && fn.call(this,...a) }	// return bool if falsish else run fn and returns it's value
  async IF$(...a)	{ return await this.iF$(...a) || this }	// returns async this as default

  // cond(fna, a, fnb, b, fnc..)	// you can call it as .cond(fn,a) .cond(fn) or even .cond() of course
  // calls fna if a else fnb if b else fnc .. and so on
  // if fn returns falsey it falls through			// like a switch case
  // if fn is void 0, it "breaks" (if bool) and returns this.	// like a switch break
  // fn parameters are (this, bool) where bool is the parameter following fn in .cond() args
  // The bool is AFTER the function, as .cond(bool) does not make any sense.
  // .cond(fn) .cond(fn,bool) .cond(fn1,bool1,fn2) .cond(fn1,bool1,fn2,bool2) and so on is more straight forward than
  // .cond(fn) .cond(bool,fn) .cond(bool1,fn1,fn2) .cond(bool1,fn1,bool2,fn2) and so on
  cond(...a)
    {
      for (let l;; a.shift())
        {
          const f = a.shift();
          if (a.length && !l && !a[0]) continue;
          // true bool or fallthrough or at list end

          if (f === void 0) return this;	// break or list end without fn

          const c = f(this, ...a);
          if (c) return c;
          l = true;				// !fn(this) fallthrough
        }
    }
  // async variant of Cond(), calling fns asynchronously
  async Cond(...a)
    {
      for (let l;; a.shift())
        {
          const f = a.shift();
          if (a.length && !l && !a[0]) continue;
          // true bool or fallthrough or at list end

          if (f === void 0) return this;	// break or list end without fn

          const c = await f(this, ...a);
          if (c) return c;
          l = true;				// !fn(this) fallthrough
        }
    }
  // call list of functions with this and value until one returns truish
  // We cannot do .switch(x).case(fn,..).case(fn,..) as this needs contexts in an async world
  // switch() always returns this
  switch(val,...fns)	{ return this.switch_(val,fns) }
  switch_(val,fns)	{ this.SWITCH_(val,fns); return this }
  // SWITCH() returns the value of the first function returning something truthy
  SWITCH_(val,fns)	{ for (const fn of fns) { const r = fn(this,val); if (r) return r } }
  SWITCH(val,...fns)	{ return this.SWITCH_(val,fns) }
  // Switch() returns a promise which resolves to the value of the first (possibly async) function returning something truthy
  Switch(val,...fns)	{ return this.Switch_(val,fns) }
  async Switch_(v,fns)	{ for (const fn of fns) { const r = await fn(this,v); if (r) return r } }
  // To fallback to this, use something like:
  // SWITCH(v,fns,_ => _)
  // Switch(v,fns,_ => _).then(_ =>
  // To always resolve to this with Switch(), use something like:
  // .Run(_ => _.Switch(..).then(() => _))
  // .Await(_ => _.Switch(..)).then(_ =>

  // const r=[]; e.TABLE.TR.td('hello').run(_ => r.push(_.TD.text('world')).td('again');
  // const r=[]; e.TABLE.TR.td('hello').TD.push(r).text('world').$$.td('again');
  // const r=[]; e.TABLE.TR.td('hello').TD.text('world').push(r).$$.td('again');
  push(...a) { a.forEach(_ => isFunction(_) ? _(this) : _.push(this)); return this }
  // const x={}; e.TABLE.TR.td('hello').run(_ => x.hello = _.TD.text('world')).td('again');
  // const x={}; e.TABLE.TR.td('hello').TD.put(x, 'hello').text('world').$$.td('again');
  // const x={}; e.TABLE.TR.td('hello').TD.text('world').put(x, 'hello').$$.td('again');
  put(...a) { let o; while (a.length) { const b=a.shift(); if (isFunction(b)) { a=b(this, ...a); continue } if (Array.isArray(b)) b.push(this); else if (!isString(b)) o=b; else o[b]=this }; return this }
  };

class _E extends _E0
  {
  __cache

  constructor(e)	{ super(e); this.__cache = {} }

  get $$()		{ return E(this.$?.parentNode); }
  clr()			{ let a; for (const e of this.__E) while (a = e.firstChild) a.remove(); return this }

  // E().ALL(selector) queries on the document
  // but: E().clr() does NOT clear the document!
  ALL(sel)
    {
      const ret = [];
      for (const e of defArr(this.$all, document))
        e.querySelectorAll(sel).forEach(_ => ret.push(_));
      const r = E(ret);
      D('ALL', sel, r);
      return r;
    }
  NAME(n)
    {
      const ret = [];
      for (const e of defArr(this.$all, document))
        e.getElementsByName(n).forEach(_ => ret.push(_));
      const r = E(ret);
      D('NAME', n, r);
      return r;
    }

  focus()		{ this.$?.focus(); return this }

  get $x()		{ return this._pos().x }
  get $y()		{ return this._pos().y }
  get $w()		{ return this.$.offsetWidth }
  get $h()		{ return this.$.offsetHeight }
  get $r()		{ return this._pos().x + this.$.offsetWidth }
  get $b()		{ return this._pos().y + this.$.offsetHeight }
  x(x)			{ return this.style({left:`${x}px`}) }
  y(y)			{ return this.style({top:`${y}px`}) }
  w(_)			{ const w=`${_}px`; return this.style({width:w,maxWidth:w}) }
  h(_)			{ const h=`${_}px`; return this.style({height:h,maxHeight:h}) }
  set $x(_)		{ this.x(_) }
  set $y(_)		{ this.y(_) }
  set $w(_)		{ this.w(_) }
  set $h(_)		{ this.h(_) }
  get $xy()		{ const p = this._pos(); return [ p.x, p.y ] }
  get $wh()		{ return [ this.$.offsetWidth, this.$.offsetHeight ] }
  get $xywh()		{ const p = this._pos(); return [ p.x, p.y, this.$.offsetWidth, this.$.offsetHeight ] }
  get $XYWH()		{ const p = this._pos(); p.w = this.$.offsetWidth; p.h = this.$.offsetHeight; return p }
  get $rb()		{ const p = this._pos(); return [ p.x+this.$.offsetWidth, p.y+this.$.offsetHeight ] }
  get $ltrb()		{ const p = this._pos(); return [ p.x, p.y, p.x+this.$.offsetWidth, p.y+this.$.offsetHeight ] }
  get $LTRB()		{ const p = this._pos(); return { left:p.x, top:p.y, right:p.x+this.$.offsetWidth, bottom:p.y+this.$.offsetHeight } }
  _pos = tmpcache(function ()
    {
      let o = this.$;
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
//set $(e)		{ this.$ = e === void 0 ? e : isString(e) ? document.getElementById(e) : e }
//e(e)			{ if (e) this.$ = e; return this }

  get $tag()		{ return this.$.nodeName }		// DIV, SPAN, etc.
  get $text()		{ return this.$.textContent }		// innerText causes reflow (and bad on IE<=11)
  set $text(s)		{ this.allev('text', $ => $.textContent=s) }
  get $align()		{ return this.$style.textAlign }	// .$.align is deprecated
  set $align(a)		{ this.$style.textAlign = a; this.mkev('align') }	// now use CSS
  get $id()		{ return this.$.id }
  set $id(id)		{ this.$.id = id }			// ONLY THE FIRST! ($.id is unique)
  get $value()		{ return this.$.value }
  set $value(v)		{ this.allev('value', $ => $.value=v) }
  get $src()		{ return this.$.src }
  set $src(u)		{ this.allev('src', $ => $.src=u) }
  get $alt()		{ return this.$.alt }
  set $alt(u)		{ this.allev('alt', $ => $.alt=u) }
  get $checked()	{ return this.$.checked }
  set $checked(b)	{ b=!!b; this.allev('checked', $ => $.checked=b) }
  get $disabled()	{ return this.$.disabled }
  set $disabled(b)	{ b=!!b; this.allev('disabled', $ => $.disabled=b) }
  get $class()		{ return this.$.classList }
  // XXX TODO XXX missing: .$class = [list] so this is idempotent: .$class = .$class
  // .$class = {classname:true, classname2:false, classname3:void 0}	// latter is toggled
  set $class(o)							// XXX TODO XXX $all!
    {
      if (isObject(o))
        this.all($ => { for (const a in o) $.classList.toggle(a, o[a]) });
      else if (isArray(o))
        this.all($ => $.classList = o);
      else
        this.all($ => $.className = o);
      this.mkev('class');
    }

  // Only create Style-class if it is really needed
  get $style()		{ return this.__cache.style ? this.__cache.style : this.__cache.style = Styles(this) }

  get $selection()	{ this.$.value.substring(this.$.selectionStart, this.$.selectionEnd) }	// XXX TODO XXX $all
  set $selection(v)	{ this.selection(v) }
  // .selectionStart changes if .value is modified
  selection(s)		{ const $ = this.$; const p = $.selectionStart; $.value = strsplice($.value,p,$.selectionEnd, s); $.selectionStart = $.selectionEnd = p; return this.mkev('cursor') }	// XXX TODO XXX $all
  // .selectionEnd may change if .selectionStart is modified
  cursormove(delta)	{ const $ = this.$; const a = $.selectionStart; const b = $.selectionEnd; $.selectionStart = a+delta; $.selectionEnd = b+delta; return this.mkev('cursor') }		// XXX TODO XXX $all
  editval(s)		{ return this.selection(s).cursormove(s.length) }

  Dataset(d)		{ const a=this.__E.map(_ => _.dataset?.[d]).filter(_ => _); return a.length<2 ? a[0] : a }

  _ADD(e)		{ e = E(e); this.add(e); return e }
  _MK(e,attr)		{ return this._ADD(X(e)).attr(attr) }
  TEXT(...s)		{ return this._ADD(T.apply(this, s)) }
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
  ctext(...s)		{ return this.aligncenter.text(...s) }
  etext(...s)		{ return this.alignend.text(...s) }
  stext(...s)		{ return this.alignstart.text(...s) }
  ltext(...s)		{ return this.alignleft.text(...s) }
  rtext(...s)		{ return this.alignright.text(...s) }
  jtext(...s)		{ return this.alignjustify.text(...s) }
  ntext(...s)		{ return this.nobr().text(...s) }
  ptext(...s)		{ return this.pre().text(...s) }
  value(...s)		{ this.$value = s.join(' '); return this }
  src(s)		{ this.$src = s; return this }
  asrc(...a)		{ this.Srcblob(...a); return this }	// sets .src in background!
  async Asrc(...a)	// sets .src() from something asynchronously, returning the new .src as a promise
    {
      const b = await Call(...a);
      if (isString(b))
        return this.$src = b;
      const o = createObjectURL();
    }

  alt(...s)		{ this.$alt = s.join(' '); return this }
  checked(b)		{ this.$checked = b; return this }
  disabled(b)		{ this.$disabled = b; return this }
  align(a)		{ this.$align = a; return this }
  center()		{ return this.align('center') }		// old align like .left().
  justify()		{ return this.align('justify') }
  left()		{ return this.align('left') }
  right()		{ return this.align('right') }
  get aligncenter()	{ return this.align('center') }		// new align like .alignleft.
  get alignend()	{ return this.align('end') }
  get alignjustify()	{ return this.align('justify') }
  get alignjustifyall()	{ return this.align('justify-all') }
  get alignleft()	{ return this.align('left') }
  get alignmatch()	{ return this.align('match-parent') }
  get alignright()	{ return this.align('right') }
  get alignstart()	{ return this.align('start') }
  // https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
  // pre:	preserve,preserve,nowrap,preserve
  // nowrap:	collapse,collapse,nowrap,remove
  // I want:	preserve,collapse,nowrap,remove
  // I (nearly always!) need something like pre which is collapsing spaces and tabs!
  // Guess what's missing from the spec!?!
  // So the 2nd next thing is to use 'nowrap', which needs to do line separation myself in case it is multi-line.
  // However this is better than 'pre', which always collapses the spaces myself when single-line.
  ws(x)			{ return this.style({ whiteSpace:x }) }
  nobr(...a)		{ return this.ws('nowrap').text(...a) }
  pre(...a)		{ return a.length ? ( this.PRE.text(...a), this ) : this.ws('pre') }
  // font shortcuts:
  get fontcap()		{ return this.font('caption') }
  get fonticn()		{ return this.font('icon') }
  get fontmnu()		{ return this.font('menu') }
  get fontmb()		{ return this.font('message-box') }
  get fontsc()		{ return this.font('small-caption') }
  get fontsb()		{ return this.font('status-bar') }
  // TODO permit object { style, variant, weight, size, height, stretch, family }
  font(font)		{ return this.style({ font }) }
  // TODO fam: serif sans-serif monospace cursive fantasy system-ui ui-serif ui-sans-serif ui-monospace ui-rounded emoji math fangsong

  // All TAGs (lowercase: includes .$$)
  get DIV()		{ return this._MK('div') }
  get PRE()		{ return this._MK('pre') }
  get A()		{ return this._MK('a') }
  get IMG()		{ return this._MK('img') }
  get TR()		{ return this._MK('tr') }
  get BR()		{ return this._MK('br') }
  get br()		{ this.BR; return this }
  get TD()		{ return this._MK('td') }
  get TH()		{ return this._MK('th') }
  get THEAD()		{ return this._MK('thead') }
  get TBODY()		{ return this._MK('tbody') }
  get HR()		{ return this._MK('hr') }
  get hr()		{ this.HR; return this }
  get SPAN()		{ return this._MK('span') }
  get CHECKBOX()	{ return this._MK('input', {type:'checkbox'}) }
  get INPUT()		{ return this._MK('input', {type:'text'}) }
  get NUMBER()		{ return this._MK('input', {type:'number',size:8}) }
  get COLOR()		{ return this._MK('input', {type:'color'}) }
  get RADIO()		{ return this._MK('input', {type:'radio'}) }
  get TEXTAREA()	{ return this._MK('textarea') }
  get TABLE()		{ return this._MK('table') }
  get BUTTON()		{ return this._MK('button') }
  get SELECT()		{ return this._MK('select') }
  get OPTION()		{ return this._MK('option') }
  get FORM()		{ return this._MK('form') }
  get LABEL()		{ return this._MK('label') }
  get IFRAME()		{ return this._MK('iframe') }
  get CANVAS()		{ return this._MK('canvas') }
  get SVG()		{ return this._MK(() => createElementNS('http://www.w3.org/2000/svg', 'svg')
                                         , {'xmlns:xlink':'http://www.w3.org/1999/xlink'}
                                         // .attr({width:100, height:100, viewBox:'x y w h'?
                                         )
                        }

  urlstate(k)		{ return this.attr({'data-urlstate':k}) }

  get DL()		{ return this._MK('dl') }
  get DT()		{ return this._MK('dt') }
  get DD()		{ return this._MK('dd') }
  get OL()		{ return this._MK('ol') }
  get UL()		{ return this._MK('ul') }
  get MENU()		{ return this._MK('menu') }		// IE6+, experimental
  get LI()		{ return this._MK('li') }

  get BLOCKQUOTE()	{ return this._MK('blockquote') }
  get FIGURE()		{ return this._MK('figure') }		// IE9+
  get FIGCAPTION()	{ return this._MK('figcaption') }	// IE9+

  get WBR()		{ return this._MK('wbr') }
  get wbr()		{ this.WBR; return this }

  get P()		{ return this._MK('p') }
  get ABBR()		{ return this._MK('abbr') }
  get CITE()		{ return this._MK('cite') }
  get DFN()		{ return this._MK('dfn') }
  get SAMP()		{ return this._MK('samp') }
  get MARK()		{ return this._MK('mark') }		// IE9+

  get H1()		{ return this._MK('h1') }
  get H2()		{ return this._MK('h2') }
  get H3()		{ return this._MK('h3') }
  get H4()		{ return this._MK('h4') }
  get H5()		{ return this._MK('h5') }
  get H6()		{ return this._MK('h6') }

  get B()		{ return this._MK('b') }		// bold
  get Q()		{ return this._MK('q') }
  get S()		{ return this._MK('s') }
  get U()		{ return this._MK('u') }
  get EM()		{ return this._MK('em') }
  get I()		{ return this._MK('i') }		// italics
  get STRONG()		{ return this._MK('strong') }
  get SMALL()		{ return this._MK('small') }
  get SUB()		{ return this._MK('sub') }		// subscript
  get SUP()		{ return this._MK('sup') }		// superscript
  get KBD()		{ return this._MK('kbd') }
  get TT()		{ return this._MK('tt') }		// typewriter
  get CODE()		{ return this._MK('code') }		// codeformatter
  get VAR()		{ return this._MK('var') }

  get DATA()		{ return this._MK('data') }		// IE-
  get TIME()		{ return this._MK('time') }		// IE-

  get BDI()		{ return this._MK('bdi') }
  get BDO()		{ return this._MK('bdo') }

  get RUBY()		{ return this._MK('ruby') }
  get RP()		{ return this._MK('rp') }
  get RT()		{ return this._MK('rt') }

  // a(url,text)		normal link
  // a(url,text,true)		_blank link
  // a(url,text,false)		_blank link with noreferrer and noopener
  // a(url,text,'target')	targeted link with noreferrer and noopener
  // a(url,text,[target],false)	possibly targeted link with noreferrer and noopener
  // a(url,text,[target],true)	possibly targeted link (with referrer and opener)
  // a(url,text,[target],"rel")	possibly targeted link with given rel
  a(url,text,trg,rel)	{ this.A.href(url).text(text).if$(trg!==void 0, this.target, trg).if$(trg!==void 0||rel!==void 0, this.rel, rel!==void 0 ? rel : trg===true); return this }
  // img(url|blob)
  // img(url|blob, fn, args..)	calls fn(rgs.., IMGelement)
  img(src, ...a)	{ this.CHAIN(...a,this.IMG.srcblob(src)); return this }	// .img(url, function(args..) { this === E.IMG.src(src) }, args..)
  th(...a)		{ for (const t of a) this.TH.text(t); return this }
  td(...a)		{ for (const t of a) this.TD.text(t); return this }
  tdl(...a)		{ for (const t of a) this.TD.alignleft.text(t); return this }
  tdr(...a)		{ for (const t of a) this.TD.alignright.text(t); return this }
  tdc(...a)		{ for (const t of a) this.TD.aligncenter.text(t); return this }
  li(...a)		{ for (const t of a) this.LI.text(t); return this }
  b(...a)		{ this.B.text(...a); return this }
  u(...a)		{ this.U.text(...a); return this }
  sub(...a)		{ this.SUB.text(...a); return this }
  sup(...a)		{ this.SUP.text(...a); return this }
  tt(...a)		{ this.TT.text(...a); return this }
  code(...a)		{ this.CODE.text(...a); return this }
  h1(...a)		{ this.H1.text(...a); return this }
  h2(...a)		{ this.H2.text(...a); return this }
  h3(...a)		{ this.H3.text(...a); return this }
  h4(...a)		{ this.H4.text(...a); return this }
  h5(...a)		{ this.H5.text(...a); return this }
  h6(...a)		{ this.H6.text(...a); return this }
  div(...a)		{ this.DIV.text(...a); return this }
  radio(k,v,t,fn,...a)	{ this.LABEL.RADIO.name(k).value(v).on('change', fn,...a).$$.text(t); return this }

  // generic click() function:  call of fn DIFFERS FROM .on('click', fn, args..)!
  // e.click(fn, args..)	// calls fn(args.., event, e, on-instance) with this bound to e
  // click('mod', fn, args..)	// calls mod(true), fn(), mod(false)
  // click('mod', null, args..)	// calls mod(true), mod(false) -- do not use
  // click('mod', args..)	// calls special mod (there are currently none, except you add one yourself)
  // see ModFn below for modifiers
  click(...a)		{ this.CLICK(...a); return this }
  CLICK(...a)		{ return this._CLICK(true, true, ...a) }
  // blick is same as click() but in bubble phase
  blick(...a)		{ this.BLICK(...a); return this }
  BLICK(...a)		{ return this._CLICK(false, false, ...a) }
  // plick is same as blick() but does not do preventDefault.
  plick(...a)		{ this.PLICK(...a); return this }
  PLICK(...a)		{ return this._CLICK(true, false, ...a) }
  _CLICK(prevent, capture,...a)
    {
      // XXX TODO XXX allow more than one modifier
      // XXX TODO XXX allow modifiers with arguments
      // XXX TODO XXX allow modifiers like "bubble" or "capture" to get rid of blick() hack
      // XXX TODO XXX allow modifier 'more' to not do preventDefault()
      const mod	= ModFn.get(a[0]);
      if (mod)
        a.shift();
      const fn	= a.shift();
      const on	= new ON('click', capture);
      const run	= async _ =>
        {
          try {
            // mod(true) might augment the fn
            const x = mod && await this.CATCH(mod,true,fn,a,_,on);
            const y = x && x !== this ? x : fn;	// hack: allow to use class methods which return "this"
            // call the fn (it can be returned by a promise)
            await this.CATCH(await y,...a,_,this,on);
          } finally {
            // mod(false)
            mod && await this.CATCH(mod,false,fn,a,_,on)
          }
        };
      return on.add(_ => { run(_); return prevent }).attach(this);
    }
  button(text,...a)	{ this.BUTTON.text(text).CLICK(...a); return this }
  // checkbox([true|false|'title'], cb, args..)
  // cb(args.., state, element)
  checkbox(...a)
    {
      let fn, t, c;
      while (a.length)
        {
          fn = a.shift();
          if (isString(fn))
            t	= fn;
          else if (fn === true || fn === false)
            c	= fn;
          else
            break;
          fn	= void 0;
        }
      const _ = this.CHECKBOX;
      if (fn)
        _.on('change', (e,_) => { fn(...a, _.$checked, _) });
      if (t)
        _.attr({title:t});
      if (c !== void 0)			// create synthetic event when state is initially set
        fn(...a, c, _.checked(c));
      return this;
    }

  get $options()	{ return (function *() { for (const a of this.$.selectedOptions) yield E(a) }).call(this) }
  get $option()		{ return E(this.$?.selectedOptions[0]) }
  set $option(s)	{ for (const a of this.$.options) if (a.value == s) return a.selected = true }

  selected(state)	{ if (state != void 0) this.$.selected = !!state; return this }

  updater(fn, ...a)	{ this._upd = [fn,a]; return this }
  UPDATE(...a)		{ return this._upd[0](this, ...this._upd[1], ...a) }
  update(...a)		{ this.UPDATE(...a); return this }
  UPD(...a)		{ return _ => { this.UPDATE(...a, _); return _ } }	// Promise.resolve(1).then(el.UPD()).then(_ => _===1)

  target(id)		{ return this.attr({target:(id === void 0 || id === true || id === false ? '_blank' : id)}) }
  rel(rel)		{ return rel === true ? this : this.attr({rel:(rel === void 0 || rel === false ? 'noreferrer noopener' : rel)}) }
  href(href)		{ return this.attr({href}) }
  id(id)		{ return this.attr({id}) }
  name(name)		{ return this.attr({name}) }	// See Callable hack why 'name' works here
  title(title)		{ return this.attr({title}) }
  placeholder(placeholder) { return this.attr({placeholder}) }

  // .attr({attr:val}) to set DOM attribute on TAG
  // .attr({attr:void 0}) removes DOM attr again
  attr(a)		{ if (a) for (const b in a) if (a[b] === void 0) for (const e of this.$all) e.removeAttribute(b); else for (const e of this.$all) e.setAttribute(b, a[b]); return this }
  // like .attr() but for style.  As .style['--custom']='1px' does not work this uses .setProperty()
  // Note that 'prop' can be any of both variants, like 'backgroundColor' and 'background-color' (in Chrome, not tested with FF yet)
  style(a)		{ if (a) for (const b in a) { const c=a[b]; if (c === void 0) for (const e of this.$all) e.style.removeProperty(b); else if (b.includes('-')) for (const e of this.$all) e.style.setProperty(b, c); else for (const e of this.$all) e.style[b]=c } return this }

  // prepend/append to parent
  get prep()		{ return (...c) => { const n=this.$, f=FRAGMENT(); if (n) for (const a of c) for (const b of E(a)) f.append(b); n.prepend(f); return this } }
  set prep(c)		{ this.prep(c) }
  add(...c)		{ const n=this.$; if (n) for (const a of c) for (const b of E(a)) n.append(b); return this }
  // prepend/append relative to current
  before(...c)		{ const n=this.$; if (n) for (const a of c) for (const b of E(a)) n.before(b); return this }
  after(...c)		{ let n=this.$; if (n) for (const a of c) for (const b of E(a)) { n.after(b); n=b }; return this }
  attach(p)		{ E(p).add(this); return this }
  pretach(p)		{ E(p).prep(this); return this }

  get FIRST()		{ return E0(this.$?.firstChild) }
  get LAST()		{ return E0(this.$?.lastChild) }
  get PREV()		{ return E0(this.$?.previousSibling) }
  get NEXT()		{ return E0(this.$?.nextSibling) }
  get CHILDREN()	{ const c = this.$all; function *iter() { for (const e of c) for (const _ of Array.from(e.children)) yield E0(_) }; return iter() }
  get CHILDNODES()	{ const c = this.$all; function *iter() { for (const e of c) for (const _ of e.childNodes.values()) yield E0(_) }; return iter() }

  setclass(o)		{ this.$class = o; return this }
  addclass(...c)	{ this.$class.add(...c); return this }
  rmclass(...c)		{ this.$class.remove(...c); return this }
  replaceclass(old,c)	{ this.$class.replace(old,c); return this }
  toggleclass(...c)	{ for (const a of c) this.$class.toggle(a); return this }
  has_class(c)		{ return this.$class.contains(c) }

  // Loaded() may fail in case image cannot be decoded (JS is far more picky than the browser itself)
  // Read: This here still is not perfect and might change in future!
  Loaded()		{ return Promise.allSettled(Array.from(this.MAP(_ => _.decode()))) }
  // Scroll into view as soon as mapped: img.Loaded().then(_ => img.show())
  // block: start (default), center, end, nearest.
  show(mode)		{ this.$?.scrollIntoView(mode || {block:'nearest'}); return this }
  // hide() should be implemented using CSS:
  // .hide { display:block !important }
  // then: .setclass({hide:bool});
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
const EE = (...s) => E(Array.from(flattenArray(s)).join(' ').split(' ').filter(_ => _!='').map(_ => document.getElementById(_)));
const E = (function(){
  const weak_refs = new WeakMap();

  Object.defineProperty(fn, '__E', { value:[] });		// XXX TODO XXX does this work for .#E as well?

  // This is not perfect, as it also copies functions,
  // which do not work.  But we ignore this for now.
  for (let klass=_E; klass?.prototype; klass = Object.getPrototypeOf(klass))
    Object.entries(Object.getOwnPropertyDescriptors(klass.prototype)).forEach(_ =>
      {
        const get = _[1].get;
        if (!Object.hasOwnProperty.call(fn, _[0]))
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
      if (e !== window)
        if (!e || !(e instanceof Node))
          {
            console.error('E called with invalid object', a);
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

// must come after E
const ModFn = new Map(
  [[false,	E.disabled]	// .click(false, fn) => disable button until function finishes
  ,[true,	E.checked]	// .click(true, fn)  => check checkbox until function finishes
// add more standard mod functions here if they suit fit with
// ModFn.set('key', fn)
  ]);

// Create a TEXT node
const TT = _ => E(_ instanceof _E0 || _ instanceof Node ? _ : document.createTextNode(`${_}`));
const T = function (...s)	// needs a bound 'this'
  {
    // T('string') is perfectly normal
    if (s.length==1 && !s[0]?.then && !isFunction(s[0])) return TT(s[0]);

    // asynchronous process the contents
    // T(Promise) or T(fn)
    // notyet: T(E())

//    const t = document.createTextNode(s[0]);
//    const update = once_per_frame(() => t.nodeValue = r.join(' '));
    const r = s.map(_ => document.createTextNode('*'));	// create dummy text entry per entry
    const e = E(r);
    s.forEach(async (_,i) =>
      {
        let x;
        try {
          for (;;)
            {
              x = await _;
              // x.then already consumed by await
              if (!isFunction(x) || x instanceof _E0)	// isFunction(E()) is always true!
                break;
              _ = x(this);
            }
        } catch (e) {
          x	= `${e}`;
        }
        //if (x instanceof _E0 && x.$parent) x='';		// wrong hack, use T(_ => { _.DIV.text('hello') }) in that case!
        // XXX TODO XXX there should be some e.replace$(i, TT(x||'')) to do this:
        const n = e.$all[i] = TT(x||'').$;
        if (r[i] === E.$) E.__e = n;				// future BUG: fails when __e becomes #e
        r[i].replaceWith(n);
      });
    return e;
  }

// Create DOM Elements wrapped in class _E
// X('div') creates a DIV (compare E.DIV)
// X('div', 'br', 'span') create three elements in E(), where .$ is the 'div'
// X(['ul', ['li', 'br', 'span']]) create <ul><li/><br/><span/></ul>	(probably wrong!)
// X(['ul', ['li', ['br', 'span']]]) create <ul><li><br/><span/><li/></ul> (probably what you want)
const X = (...args) =>
  {
    const has = new Set();
    const x=[];

    function dom(_)
      {
        if (has.has(_))	return;				// avoid infinite recursion
        has.add(_);
        const fn	= _[0];
        if (isFunction(fn) && !(fn instanceof _E0))
          _	= [fn(..._.slice(1))];			// allows to call CreateElementNS
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

// Event emitter class:
// reg = o.ON('ev1 ev2 ev3', fn)	// register events
// o.OFF(reg)				// unregister
// fn({o,t,d,x}) where o==instance, t=event, d=data, x=eXtended (argument array) depending on the event
// if fn() returns truthy, it is removed (from all events it is registered)
// if fn() throws, it is removed (from all events it is registered)
class Emit
  {
  __on

  constructor(events)
    {
      if (!isArray(events)) events=events.split(' ');
      events.push('ON','OFF', '*');
      const o = {};
      events.forEach(_ => o[_]=new Map());
      this.__on = o;
    }
  ON(what, fn)
    {
      const id = [];
      for (const t of what.split(' '))
        if (t)
          {
            const m = this.__on[t];
            if (!m) throw `unknown event ${t}`;
            m.set(id,fn);
            id.push(t);
          }
      Object.freeze(id);
      this._Emit('ON', {id,fn})
      if (id.length)
        return id;
    }
  OFF(id)
    {
      if (id) id.forEach(_ => this.__on[_].delete(id));
      return this._Emit('OFF', {id})
    }
  async _Emit(t, d, ...x)
    {
      await void 0;				// run as microtask
      const emit = (v,k) =>
        {
          try {
            if (!v({o:this,t,d,x})) return;
          } catch (e) {PErr(e)}
          this.OFF(k);
        };
      this.__on['*'].forEach(emit);		// * receives all events
      try {
        this.__on[t].forEach(emit);		// send to the given event functions
      } catch (e) {
        console.error(`BUG: misspelled event '${t}' (or missing in ${this.constructor.name} constructor/super call):`, e);
      }
    }
  };

// Asynchronous unidirectional Queue, with events
// This queue is not meant to be very efficient when it comes to multiple readers/writers
// It is meant to have a very clean and easy to use interface.
// const q = UniQ();
// await q.Put(data).then(data => ..);
// await q.Get().then(data => ..);
// Queueing is first-come, first-served.
// Waiting is not yet fair:
// - If queue gets full, first one which is blocked waits longest!
class UniQ extends Emit
  {
  constructor(max)
    {
      super('max put get');
      this._max = max || 0;
      this.reset();
    }
  reset()
    {
      this._q	= [];
      this._cnt	= {put:0,get:0};
      this._chg('max', this._max);			// queue resetted
      return this;
    }
  _chg(what,d)
    {
      const	p = this._p;
      this._p	= PO();
      if (p)
        p.ok(what);
      this._Emit(what,d);
      return this;
    }
  WaitN()		// wait for something to happen on Q
    {
      if (!this._p)
        this._p	= PO();
      return this._p.p;
    }
  get $gets()	{ return this._cnt.get }
  get $puts()	{ return this._cnt.put }
  get $cnt()	{ return Object.assign({}, this._cnt) }
  get $len()	{ return this._q.length }
  get $max()	{ return this._max }
  set $max(m)	{ this._max = m; this._chg('max', m) }	// max changed
  async Put(e)
    {
      this._q.push(e);
      this._cnt.put++;
      const max = this._q.length;
// To create fair queuing: Only wait until our entry reaches the queue below max
// However for this we must be able to count the gets
      this._chg('put', e);				// element added
      while (this._q.length>this._max && this._max>0)
        await this.WaitN();
      return e;
    }
  async Get(n)		// get.  You can wait Q above some fillstate
    {
      n = n|0;
      if (n<0) n=0;
      while (this._q.length<=n)
        await this.WaitN();
      const r = this._q.shift();
      this._cnt.get++;
      this._chg('get', r);				// element removed
      return r;
    }
  async Room(n)		// wait for Q having room.  Returns free buckets
    {
      n = n|0;
      if (n<1) n=1;
      n--;
      while (this._q.length+n >= this._max && this._max>n)
        await this.WaitN();
      return this._max - this._q.length;
    }
  async Fill(n)		// wait for Q having data.  Returns current fill state
    {
      n = n|0;
      if (n<1) n=1;
      while (this._q.length<n)
        await this.WaitN();
      return this._q.length;
    }
  async Full()		// wait for Q to get completely filled.  Returns current fill state
    {
      n = n|0;
      if (n<1) n=1;
      while (this._q.length<this._max || this._q.length<n)
        await this.WaitN();
      return this._q.length;	// this can be >max
    }
  async* [Symbol.asyncIterator]()
    {
      for (;;)
        yield await this.Get();
    }
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

// q = new EasyQ();						// Easy to use Queue
//
// .addEventListener('event', q.CB(qargs..))			// enqueues all the events received into the queue
// .addEventListener('event', q.FN((..._) => _, args..))	// same, but calls the given fn and enqueues what this returns
//								// use q.Fn() if fn is asynchronous
// for await (const val of q) {					// val is [qargs..,args_of_callback]
//
// return new Promise(q.P())					// resolves the promise based on the next enqueued value
// q.push(123)							// resolves the promise with 123
// q.stop(123)							// rejects the promise with 123
//
// await q.push(v);	// push value
// v === await q.Pop();	// get value
class EasyQ
  {
  constructor()		{ this._q = [] }

  get cnt()		{ return this._q.length }
  signal()		{ this._p?.ok(); this._p = void 0; return this }

  async Wait()		{ if (!this._p) this._p	= PO(); await this._p.p }
  async Has()		{ while (!this._q.length && !this._stop) await this.Wait(); return this._q.length }

  _push(o)		{ if (this._stop) throw 'queue already stopped'; this._q._push(o); return this.signal() }
  _next()		{ const r = this._q.shift(); this.signal(); if (!r.v) throw r.e; return r.v }

  push(...v)		{ return this._push({v:v.length===1 ? v[0] : v}) }
  async Pop()		{ if (await this.Has()) return this._next() }

  stop(...e)		{ if (e.length) this._q._push({e}); this._stop = true; return this.signal() }
  async Stop(...e)	{ this.stop(...e); while (this._q.length) await this.Wait() }	// await q.Stop() waits for q drained

  P()			{ return async (o,k) => { if (await this.Has()) o(this._next()); else k(); } }

  CB(...a)		{ return (..._) => this.push(...a,..._) }
  FN(fn,...a)		{ return (..._) => { try { const v = fn(...a,..._); this._push({v}) } catch (e) { this._push({e}) } } }
  Fn(fn,...a)		{ return (..._) => { new Promise(o => o(fn(...a,..._))).then(v => this._push({v}), e => this._push({e})) } }

  async* [Symbol.asyncIterator]()
    {
      while (await this.Has())
        yield this._next();
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
// easy global state keeping, see also urlstate.js
//
// st	= UrlState('id', def);	// location.hash keeps #id:val# where val is JSON
// console.log(st.state)	// get current value
// st.state = value		// change current value
// console.log(st.perm)		// retain current value (for URL back)
// st.perm = value		// retain current value and change it
//
// Triggers .on() if state changes (but not on something like: st.state = st.state)
class Keep extends OnOff
  {
  constructor(keeper, id, def)
    {
      super();
      this._k	= keeper;
      this._id	= id;
      this._d	= def;
    }
  get state()
    {
      const  v	= this._k.get(this._id);
      return v === void 0 ? this._d : v;
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

// new Cookie('name')				=> SESSION COOKIE
// new Cookie({name:'name', expire:-2})		=> 2 year cookie
// new Cookie({name:'name', expire:3600})	=> 1 hour cookie
// UrlState().buttons()-Cookie defaults to 1 year!
//
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
      const x = `${this.$name}=`;
      for (let c of document.cookie.split(';'))
        {
          if (c.startsWith(' ')) c = c.substr(1);
          if (c.startsWith(x))
            {
              this._val	= UD(c.substr(x.length));
              CONSOLE('cookie was set', this.$name, this._val);
              this.trigger();
              return;
            }
        }
      CONSOLE('cookie unknown', this.$name);
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
  // $expire = 10 means expire in 10 seconds
  // $expire = 0 means: session cookie
  // $expire = -10 means: in 10 years
  // $expire = true: NOT YET DEFINED, in future: session-cookie
  // $expire = false: NOT YET DEFINED, in future: never expires (set some max value)
  // use .del to expire a cookie!
  set $expire(d) { this._exp = d && new Date((d|0)>0 ? Date.now()+d*1000. : (d|0)<0 ? Date.now()-d*1000.*3600*24*366 : d).toUTCString() }

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

      c = `${this._name}=${c}${d}${e}${n}${p}${s}`;
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
  let ass, rep;
  const upd = once_per_ms(100,() =>
    {
      if (ass)
        location.assign(ass);
      ass	= void 0;
      if (rep)
        location.replace(rep);
      rep	= void 0;
    });
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

          ass = url;
          rep = void 0;
          save	= 0;
          perm	= {};
          for (const a of keeper.states())
            perm[a]	= keeper.get(a);
        }
      else
        {
          D('UrlState tmp', id, v, url)
          rep	= url;
        }
      upd();
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
  function buttons(name, el, set, del, expire)
    {
      // UrlState.buttons() -> this points to UrlState === run
      // so you can wrap it to change the functions
      if (expire === void 0) expire = -1;
      name	= name || 'state';
      el	= E(el || name);
      const c	= el.BUTTON.text(set || 'set').on('click', _ => this.set());
      const d	= el.BUTTON.text(del || 'del').on('click', _ => this.del());
      this.COOKIE({name, expire}).on(a => { d.disabled(!a); c.$class = { green8:!!a, red8:!a }; d.$class = { grey8:!a } }).trigger();
      return this;
    }

  init();
  function run(id, def) { return reg[id] || (reg[id] = new Keep(keeper, id, def)) }
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

    async Def(k,f,...a)	{ const e = this._get_(k); if (e) return e.v; const v = f(...a); this.set(k,v); return v.then(_ => { const o = this._get_(k); return o.v === v ? this.Set(k,_) : o.v }) }
    DEF(k,f,...a)	{ const e = this._get_(k); if (e) return e.v; const v = f(...a); this.set(k,v); return v; }
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
    Set(k,v) { this.set(k,v); return v }
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


// AsyncActionQueue() returns an object with following properties:
// .run(args)	runs the action queue.
//		Returns a Promise which resolves to args if everything went smoothly
//		Else it catches the last thrown error or void 0 if interruped
// .add(cb,...)	add action (callback) with calls cb(...,args)
//		returns an object with two functions:
//		.remove()	remove remove the cb.  Returns .state()
//		.state()	Promise which resolves/rejects to the last (or current pending) invocation of the cb.
//				If the cb was never called, this promise rejects.
//		.next()		Promise which resolves to the next result of the invocation of cb
//		.emit()		Return the Emit() class of this callback
// .stop(clr)	stops running the queue until .start() is issued
//		pending cbs are not called
//		if clr is truthy, all pending cbs are aborted
//		Returns a Promise which resolves when the queue was stopped
//		It cancels if the queue is started or stopped again before the stop finished
// .start(clr)	starts running the queue. The queue comes .start()ed
//		Does nothing if already started.
//		If clr is truthy, all pending actions and .run() calls are aborted
//		Does not restart if nothing needs to be done.
//		If .run() was called while it was stopped the queue is restarted with the args
//		else if pending cbs need to be called the queue continues where it stopped
//		Returns a Promise which resolves if the queue finishes running.
//		It cancels if the queue is started or stopped again before the stop finished
// Note that adding a new cb runs the cb automatically with the last .run() argument.
// If there was none yet, then nothing happens.
const AsyncActionQueue = () =>
  {
    let halt, po, run = POC(), pos, next, arg, head, tail;

    const remove = o =>
      {
        if (!o.p) return;		// already removed
        delete o.cb;			// mark it to be deleted

        o.emit?._Emit('x');

        if (pos && o === tail) return;	// we cannot delete the tail if not idle, else we lose newly .add()ed in this queue run

        delete o.p;			// mark it deleted

        if (o === head)	head		= o.tail;
        if (o === tail)	tail		= o.head;
        if (o.head)	o.head.tail	= o.tail;
        if (o.tail)	o.tail.head	= o.head;

        // empty o:
        if (next === o) next = o.tail;
        delete o.head;
        delete o.tail;
      }
    const step = () =>
      {
        const start	= next;
        if (!start || pos || halt)
          return;			// nothing to do, already running or stopped

        const args	= arg;
        if (!args)
          {				// cleared
            next	= 0;		// stop this run
            run.ko();			// signal run was aborted (as start != 0)
            return;
          }

        next	= start.tail;		// remember next cb in queue to run after this one

        const cb	= start.cb;
        if (!cb)
          {				// is this really needed?
            remove(start);		// this node was not yet removed
            return step();		// loop to next
          }

        pos	= start;		// lock this run
        const p	= new Promise(_ => _(cb(...args)));	// call cb within Promise
        start.p	= p;
        p.then(_ => start.emit?._Emit('o', _), _ => start.emit?._Emit('k', _));
        p.finally(() =>
          {
            if (pos !== start)
              console.error('pos != start', {pos,start});
            pos	= 0;
            if (!next)
              run.ok(args);		// signal end of this run
            step();			// run the next thing
          });
      };

    return (
      { run:	(...a) =>
        {
          arg	= a;

          run.ko();			// cancel previous run
          run	= POC();
          step(next = head);
          return run.p;
        }
      , add:	(cb,...a) =>
        {
          if (!cb) throw 'missing callback function';
          // XXX TODO XXX check for callable?

          if (a.length)
            cb	= (..._) => cb(...a, ..._);

          const o = { head:tail, cb, p:PR };

          // add it to the queue
          if (!head)
            head = o;
          if (tail)
            tail.tail	= o;
          tail	 = o;
          if (o.head && !o.head.p)
            remove(o.head);		// remove previous tail if marked to be deleted

          const emit =	() =>
            {
              if (!o.emit)
                {
                  o.emit	= new Emit();
                  o.emit._Emit('c');
                }
              return o.emit;
            }

          return (			// WTF: why are parantheses needed here?
            { emit
            , state:	() => { return o.p }
            , remove:	() =>		// WTF: why is class type notation impossible here?
              {
                const p = o.p;		// remember last state
                remove(o);		// remove from queue
                return p;		// return last state
              }
            , next:	() =>		// this is not very efficient, sorry
              {
                const e	= emit();
                return new Promise((ok,ko) => e.ON('o k', ({o,t,d}) => { if (t==='o') ok(d); else ko({t,d}); return true }));
              }
            }
            );				// WTF: why are paratheses needed here?
        }
      , stop: clr =>
        {
          halt = true;			// stop running the queue
          if (clr)
            arg	= void 0;

          po?.ko();			// cancel previous .start()/.stop() promise
          po	 = PO();

          if (pos)
            pos.p.then(po.ok, po.ok);	// queue became idle
          else
            po.ok();			// queue is idle already

          return po.p;
        }
      , start:	clr =>
        {
          halt = false;			// allow running the queue
          if (clr)
            arg	= void 0;

          po?.ko();			// cancel previous .start()/.stop() promise
          po	 = PO();

          if (run)
            run.p.then(po.ok, po.ok);	// last run() finished
          else
            po.ok();

          step();			// start the queue (if needed)

          return po.p;
        }
      }
    );
  };

// onResize(cb) calls cb({x,y,w,h}) on resizes where:
// w	full width (of visible area)
// h	full height
// x	usable width (margin subtracted)
// y	usable height
// currently cbs cannot be removed, perhaps this will be implemented in future
//
// XXX TODO XXX somehow prevent resize loops
// (things jumping forth and back due to scrollbars)
//
// This perhaps can be observed when a resize comes in while q.run() ran.
// which means a resize happened while it resized.
// This can happen because the user quickly changes window size.
// So we should not only watch out for the usable area but also for the complete area.
//
// https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
/*
   console.log('Window', window.innerWidth, window.innerHeight);					// includes scrollbars
   console.log('HTML', document.documentElement.clientWidth, document.documentElement.clientHeight);	// excludes scrollbars
*/
const onResize = (_=>_())(() =>
  {
    let q, b, wh, o;

    const get = () =>
      {
        const br = getComputedStyle(b);
        const [w,h] = wh.$wh;
        const x = b.offsetWidth;
        const y = h - parseInt(br.marginTop) - parseInt(br.marginBottom);
        if (x === o.x && y === o.y && w === o.w && h === o.h) return;
        return o = { x,y,w,h };	// computed new usable full size
      };
    // Newly delivered resize events are delayed if a callback still is active.
    // This circumvents the lack of Promises() not being cancelable in JS.
    // Also this allows to handle resizes gracefully by returing SleeP(100) or similar.
    const ready = () =>
      {
        // Watch out for resizes
        const r	= new ResizeObserver(_ =>
          {
            if (!get()) return;	// no change in size
//            console.log('RESIZE', _, wh.$w, wh.$h);
            q.run(o);
          });

        // Cover the full visible area of the browser with a dummy DIV in background
        o	= {};
        b	= document.body;	// document.body may be NULL on load, so do it here
        wh	= E(b).DIV.style({position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:-999,opacity:0,visibility:'hidden'});
        r.observe(wh.$);	// detect when this dummy DIV becomes resized

        q.run(get());
      };
    const init = () =>
      {
        q	= AsyncActionQueue();
        DomReady.then(ready);
      }
    return (cb, ...a) =>
      {
        if (!q) init();
        q.add(cb, ...a);
      }
  });

//
// NOT IMPLEMENTED YET below
//
/**/

// Some Value which might change
// v = V()				Create a value of 0
// v = V(init)				Create with INITial value (can be object)
// v = V('hello world', _ => return T(_))	use render function
// v.$					get rendered value (as _E)
// v.addTo(e)				add rendered value to element, return this
// v.get(e)				get rendered value wrapped in the given element
// v.render(_ => ..., ...)		get rendered value based on renderer
// v.set(newvalue)			set value
// v.add()				increment value
// v.add(delta)				increment value	by delta (negative ok)
//
// What is the catch?
// - The catch is that the DOM automatically updates when V.set() is called.
// - Also you can use .ON()

const V = new WeakCache(_ => new _V(..._)).factory;
class _V extends _E0
  {
  _v; _r; _a

  constructor(val, render, ...args)
    {
      super();
      this._v	= val;
      this._r	= render;
      this._a	= args;
    }

  get $()	{ return this.render() }
  get(e, ...args)
    {
      const r	= this.render(...args);
      e.add(r);
      return this;
    }
/*
      this.ON(
      e.add(
      e = this._r ? this._r(...this._a
        e = X(this._v);
    }
*/
  }

/*
// Promise/async based Do queue.
// .then(function) is somewhat clumsy.  Hence here I reinvent the wheel:
// d = DO();
// d.do(fn, args).do(fn2, args2) and so on
// d.then -> Promise.all([do-invocations]).then
// d.catch -> Promise.all([do-invocations]).then
const DO = (fn, args) =>
  {
    const r = [];
    const _ = {};
    const call = (fn,...a) => { const p = ((async () => fn(...a))()); r.append(p); return p };

    return \
      { 'Do':	call,
      , 'do':	(...a) { call(...a); return _ }
      , 'then': (...a) => Promise.all(r).then(...a)
      , 'catch': (...a) => Promise.all(r).catch(...a)
      }

    const p = 
  constructor(keeper, id)
    {
      super();
  };

// Easy state synchronization, register, wait for and trigger states
//
// States are None (nothing in this state), Some (neither non nor All in state), All (all in state)
// The Promise is fullfilled if the state is reached
//
// somestate = State()
// somestate.None('idle').then(trigger)		// triggers once on: None
// somestate.Some('idle').then(trigger)		// triggers once on: Some
// somestate.All('idle').then(trigger)		// triggers once on: All
// somestate.Any('idle').then(trigger)		// triggers once on: Some|All
// somestate.Free('idle').then(trigger)		// triggers once on: None|Some
// r = somestate.On('idle', cb, args)		// when something enters/leaves 'idle'
// somestate.Off(r)				// stop 'on' again
//
// fn = somestate.ADD()
// fn('idle')		// triggers triggered
// fn(somestate.DEL)	// removes the state again
//
class State
  {
    DEL	= Symbol()
    NEW	= Symbol()

    constructor()
      {
        this._states	= {};
        this._state	= {};
        this._args	= {};
        this._fn	= {};
        this._cnt	= 0;
        this._nr	= 0;
      }

    _del(name, state)
      {
        if (!(name in this._state)) THROW(`State._del(${name}) of unknown`);
        this._state[name]	= 0;
      }

    _add(name, state, a)
      {
        this._args[name]	= a;
        this._state[name]	= state;
        const n			= 1+(this._states[state] || 0);
        this._states[state]	= n;

        this._trigger('any', state, name);
        if (n==this._cnt)
          this.trigger('all', state, name);
      }
    _trigger(tag, state, name)
      {
        const s = this[`_${tag}`];
        if (!s) return;
        const t = t[state];
        delete t[state];
        for (const f of t)
          f({org:this, type:tag, state:state, cause:name});
      }

    _set(name, state, ...a)
      {
        if (!state) state = 0;
        if (!(name in this._state)) return this.DEL;
        const old = this._state[name];
        this._args[name]	= a;
        if (old === state) return old;

//        this.

        if (state === this.DEL)
          {
            this._cnt--;
            delete this._state[name];
            delete this._args[name];
            //delete this._fn[name];
          }
        else
          {
          }
      }

    ADD(name, ...a)
      {
        this._nr++;
        this._cnt++;
        name	= name ? `${this.nr}: ${name}` : `${this.nr}`;
        const self = this;
        function change(s) { return self._set(name, s); }
        //this._fn[name]	= change;
        this._add(name, this.NEW, a)
        return change
      }
    None(s)
      {
      }
    Any(s)
      {
      }
    All(s)
      {
      }
  }
*/

