'use strict';
// APP.html:
//
// <!DOCTYPE html>
// <html><head><meta charset="UTF-8"/>
// <title>APP</title>
// <link rel="stylesheet" type="text/css" href="APP.css"/>
// <script src="er13.js" data-append="err"></script>
// <script src="es13.js"></script>
// <meta name="loadmodule" data-as="main" content="APP.js"/>
// <meta name="loadmodule" data-as="lib"  content="APPLIB.js"/>
// </head><body>
// <div id="err"></div>
// <div id="main">Please enable JavaScript</div>
// <script type="module" src="loadmain.js"></script>
// </body></html>
//
// APP.js:
//
// export class Main
//   {
//   constructor(_)
//     {
//       this.div = _;
//     }
//   async main(modules)
//     {
//       this.lib = await modules.lib;
//       this.lib.hello_world(this.div);
//     }
//   }
//
// APPLIB.js:
//
// export function hello_world(e) { e.$text = 'hello world' }

const _ = E('main').clr().text('initializing');
try {
  const { default:modules } = await import('./loadmodule.js')
  console.log(_.$text = 'loading');
  const main = await modules.main;
  console.log(_.$text = 'loaded');
  if (!main.Main) throw 'missing class Main';
  const run = new main.Main(_);
  if (!run.main) throw 'missing classfunction Main.main()';
  run.main(modules);
} catch (e) {
  _.$text = `load failed: ${e}`;
  throw e;
}

