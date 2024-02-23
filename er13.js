'use strict';	// This is for ES13 aka ES2022
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

// Minimalistic global error catcher/reporter:
// <script src="er13.js" data-post="https://error.example.com/errortarget" data-tag="sometag"></script>
// <script src="er13.js" data-append="element-id" data-appendms="20000" data-noclick></script>
// <script src="er13.js" data-debug="console-prefix"></script>
// <script src="er13.js" data-call="function"></script>

const __CATCH__ = (f => f(document.currentScript?.dataset || {debug:'ER13'}, document.currentScript?.url))((ds,url) => {

  // __CATCH__(fn): calls fn(e,j) on errors, j is a JSON serializable object
  const props = o =>
    {
      const prop = {};
      const set = new Set(), sub = new Set().add(window);
      let p = o;
      while (p && !set.has(p))
        {
          set.add(p);
          Object.getOwnPropertyNames(p).forEach(_ =>
            {
              if (_ in prop) return;
              let x = o[_];
              if (!x || sub.has(x)) return;
              const t = typeof x;
              if (t === 'string') return sub.add(prop[_] = x);
              if (t !== 'object') return;
              sub.add(x);
              let c;
              if (x.outerHTML)			x = x.outerHTML;
              else if (x instanceof Error)	{ `${x.stack}`.split('\n').forEach((s,i) => s && (prop[`${_}.stack[${i}]`] = s)); x=x.message }
              else if (x instanceof Promise)	c = 'uncaught Promise';
              else				c = `unsupported ${x}`;
              if (c) { console.log?.(url||'(no url)', c, x); x	= `[see console: ${c}]` }
              prop[_]= `${x}`;
            })
          p = Object.getPrototypeOf(p);
        }
      return prop;
    }
  const CATCH = fn =>
    {
      // a global catch for errors and unhandled rejections
      let w = e => { const v=e.error || e.reason || e; try {
        const o=props(e);
        ['filename','lineno','colno'].filter(_ => e[_]).forEach(_ => o[_]=e[_]);
        fn(e, o);
      } catch(e) { console.log?.('CATCHERR', e) } }
      window.addEventListener('error',w,true);
      window.addEventListener('unhandledrejection',w);
      window.addEventListener('es11_catched_error_event',w);
      window.addEventListener('esXX_catched_error_event',w);
      // do we need even more?
    }

  // Output to console: data-debug="prefix"
  // For environments lacking console we should forward this problem to somewhere else.
  if (ds.debug)
    // Actually this is a BUG for environments lacking console.
    // We should forward this problem to the other error handlers.
    CATCH((e,d) => console.error?.(ds.debug,e,d));

  // Append <PRE> to some element: data-append="element-id"
  // when clicked error message is copied to clipboard and removed
  if (ds.append)
    CATCH((e,d) =>
      {
        const f = r => (f => f(document.getElementById(ds.append)))(o =>
//            { console.log('f', o,r,ds.appendms); return (
            o ? o.append(((f => f(document.createElement('PRE')))(l =>
                {
                  l.innerText = Object.keys(d).map(k => `${k}: ${d[k]}`).join('\n');
                  if (ds.appendms != 0) setTimeout(() => l.remove(), parseInt(ds.appendms) || 33333);
                  if (!ds.noclick)
                    l.onclick = () => { try { navigator.clipboard.writeText(l.innerText).then(() => l.remove()); } catch(e) { console.log('failed to copy error message to clip', e) }};
                    return l;
                })))
              : r ? setTimeout(f,r,r-1)
              : 0
                // Actually this is a BUG:
                // If ID is not available we should throw.
                // However this would create a loop here,
                // so we somehow must evade this.
//            )}
          );
        // try 100 times to get the element
        setTimeout(f, 0, 100);
      });

  // POST to some URL as JSON {e:{error-object}, t:tag}: data-post="URL" data-tag="tag"
  if (ds.post)
    {
      const u = new URL(ds.post, new URL(url, window.location));
      const t = ds.tag;
      CATCH((_,e) => fetch(u,
        { cache:'no-cache'
        , method:'POST'
        , headers:{'Content-Type':'application/json'}
        , body:JSON.stringify({e, t})
        }).then(r => { if (r.ok) return r.text();
          throw new Error(`CATCH failed: ${r.url} failed with ${r.status}: ${r.statusText}`) })
        .catch(console.log)
        // Actually the .catch() before is a BUG:
        // We shall throw errors to all other CATCH() handlers here that the POST did not work.
        // Also we should retry after a little waiting time and give up at too many retries.
        // This, however, needs to create some own clever Error object which is a lot of work.
       );
    }

//  if (ds.call)
//    CATCH((e,d) => CALL(_ =>
//      {
//        while (!window[ds.call])
//        if (d]); proc(calls, _ => window[ds.call](..._)));
//      }

  return CATCH;
});

