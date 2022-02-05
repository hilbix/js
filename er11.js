'use strict';	// This is for ES11 aka ES2020
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

// Minimalistic global error catcher/reporter:
// <script src="er11.js" data-post="https://error.example.com/errortarget" data-tag="sometag"></script>
// <script src="er11.js" data-append="element-id" data-appendms="20000" data-noclick></script>
// <script src="er11.js" data-debug="console-prefix"></script>

// __CATCH__(fn): calls fn(e,j) on errors, j is a JSON serializable object
const __CATCH__ = fn =>
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
    window.addEventListener('es11_catched_error_event',w);
    // do we need more?
  }

// Output to console: data-debug="prefix"
if (document.currentScript.dataset?.debug)
  // Actually this is a BUG for environments lacking console.
  // We should forward this problem to the other error handlers.
  (f => f(document.currentScript.dataset.debug))(s => __CATCH__((e,d) => console.log?.(s,e,d)));

// Append <PRE> to some element: data-append="element-id"
// when clicked error message is copied to clipboard and removed
if (document.currentScript.dataset?.append)
  (f => f(document.currentScript.dataset.append, document.currentScript.dataset.appendms))((id,ms) =>
    __CATCH__((e,d) =>
      {
        const f = r => (f => f(document.getElementById(id)))(o =>
//            { console.log('f', o,r,ms); return (
            o ? o.append(((f => f(document.createElement('PRE')))(l =>
                {
                  l.innerText = Object.keys(d).map(k => `${k}: ${d[k]}`).join('\n')
                  if (ms != 0) setTimeout(() => l.remove(), parseInt(ms) || 33333);
		  if (!document.currentScript.dataset.noclick)
		    l.onclick = () => { try { navigator.clipboard.writeText(l.innerText).then(() => l.remove()); } catch(e) { console.log('failed to copy error message to clip', e) }};
                  return l;
                })))
              : r ? setTimeout(f,r,r-1)
              : 0
                // Actually this is a BUG:
                // If ID is not available we should throw.
                // However this would create a loop here,
                // so we somehow must evade this.
//          )}
          );
        setTimeout(f, 0, 100);
    }));

// POST to some URL as JSON {e:{error-object}, t:tag}: data-post="URL" data-tag="tag"
if (document.currentScript.dataset?.post)
  (f => f(new URL(document.currentScript.dataset.post,
                  new URL(document.currentScript.url, window.location))
         ,document.currentScript.dataset.tag))((u,t) =>
    __CATCH__((_,e) => fetch(u,
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

