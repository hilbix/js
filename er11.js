'use strict';	// This is for ES11 aka ES2020

// Minimalistic global error catcher/reporter:
// <script src="er11.js" data-post="https://error.example.com/errortarget" data-tag="sometag"></script>
// <script src="er11.js" data-append="element-id"></script>
// <script src="er11.js" data-debug="console-prefix"></script>

// CATCH(fn): calls fn(e,j) on errors, j is a JSON serializable object
const CATCH = fn =>
  {
    // a global catch for errors and unhandled rejections
    let w = e => { const v=e.error || e.reason; try {
        let o={type:e.toString?.()}
        if (v?.stack) o.stack = v.stack;
        else o.reason = e.reason;	// Without .catch(THROW) you do not get a stackframe from Promise.reject()!
        if (v?.message) o.message = v.message;
        ['filename','lineno','colno'].filter(_ => e[_]).forEach(_ => o[_]=e[_]);
        fn(e, o);
      } catch(e) { console.log?.('CATCHERR', e) } }
    window.addEventListener('error',w,true);
    window.addEventListener('unhandledrejection',w);
    // do we need more?
  }

// Output to console: data-debug="prefix"
if (document.currentScript.dataset?.debug)
  // Actually this is a BUG for environments lacking console.
  // We should forward this problem to the other error handlers.
  (f => f(document.currentScript.dataset.debug))(s => CATCH((e,d) => console.log?.(s,e,d)));

// Append <PRE> to some element: data-append="element-id"
if (document.currentScript.dataset?.append)
  (f => f(document.currentScript.dataset.append))(id =>
    // Actually this is a BUG:
    // If ID is not available we should throw.
    // However this would create a loop here,
    // so we somehow must evade this.
    CATCH((e,d) => document.getElementById(id)?.append((f=>f(document.createElement('PRE')))(e =>
      {
        e.innerText = Object.keys(d).map(k => `${k}: ${d[k]}`).join('\n')
        return e;
      }))));

// POST to some URL as JSON {e:{error-object}, t:tag}: data-post="URL" data-tag="tag"
if (document.currentScript.dataset?.post)
  (f => f(new URL(document.currentScript.dataset.post,
                  new URL(document.currentScript.url, window.location))
         ,document.currentScript.dataset.tag))((u,t) =>
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
     ));
