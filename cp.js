'use strict';	// this is for ES11 aka ES2020

// CP: Cancellable Promises
// Based on ideas found in
// - https://github.com/tc39/proposal-cancellation
// - https://seg.phault.net/blog/2018/03/async-iterators-cancellation/
// - https://github.com/kriskowal/context
//
// new CP((ok,ko,ctx) => {..})	<==>	ctx = new CP(Promise.new((ok,ko) => {..}))	// right side code DOES NOT WORK as shown
// const ctx = CP.fetch(...);
// ctx.cancel('cause').
// ctx.cancelled.then(..)
// ctx.then(_ => _.json)..
class CP	// this does not extend Promise on purpose
  {
  // these should be public constants:
  static Error = class extends Error {}
  static ErrorClass(s) { return class extends CP.Error() { constructor() { super(s) } } }
  static TimeoutError = CP.ErrorClass('context timeout');
  static CancelledError = CP.ErrorClass('context cancelled');
  static __m = new WeakMap();

  // these should be private modifiables:
  __p; __c

  static __CTX = class
    {
    __p; __o; __k
    constructor(p)
      {
        this.__p = p;
        /* I respect the idea to prevent hazard by making this immutable	*/
        Object.freeze(this);
      }
    get Cancelled() { return this.__p }
    get CANCEL() { return this.__CANCEL.bind(this) }
    __CANCEL(arg) { if (this.__o) return this.__o(arg); throw new Error('already cancelled') }



    set(map,v)	{ map.set(this,v); return this }
    SET(map,v)	{ map = map || new WeakMap(); map.set(this,v); return map }
    GET(map)
      {
        for (let ctx = this; ctx; ctx=CP.__m.get(ctx))
          if (map.has(ctx))
            return map.get(ctx);
      }
    };
  static base = CP.__CTX( this.__p = new Promise((ok,ko) => { this.__o = ok; this.__k = ko });

  constructor(fn)
    {
      let o,k;
      this.__p	= new Promise((ok,ko) => { o=ok; k=ko });
      this.__c	= new CP.__CTX();
      fn(o,k,this.__c);
    }

  get $()	{ return this.__p }

  get Cancelled() { return this.__c.cancelled }
  get CANCEL()	{ return this.__c.cancel }

  GET(map)	{ return this.__c.get(map) }
  SET(map,v)	{ return this.__c.SET(map,v) }
  set(map,v)	{ this.__c.set(map,v); return this }

  // convenience (sadly these do not return this)
  get then(...a) { return this.__p.then(...a) }
  get catch(...a) { return this.__p.catch(...a) }
  get finally(...a) { return this.__p.finally(...a) }

  // Things we definitively need out of the box:
  // const ctx = CP.fetch(...);
  // ctx.$.then(..)
  // ctx.cancel('cause').
  // ctx.cancelled.then(..)
  static fetch(url,opt)
    {
      opt = opt || {};
      const ctx = new CP();
      const ac = new AbortController();
      if (opt.signal)
        opt.signal.addEventListener('abort', _ => ctx.cancel(_));
      opt.signal = ac.signal;
      ctx.cancelled.then(_ => ac.abort(_));
      const p = fetch(url,opt);
      p.cancel		= ctx.cancel;
      p.cancelled	= ctx.cancelled;
    }
  sleep(ms)
    {
      return new Promse
    }
  };

Object.freeze(CP);	// make the class immutable

