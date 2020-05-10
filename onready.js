///STANDALONE
// Compatible to idea presented in https://gist.github.com/shesek/441c02cf1f094c36f57a
//
// ;window.onready=[window.onready, YOUR_INIT_FUNCTION];
//
// If HTML is written this way, it ensures, that YOUR_INIT_FUNCTION is called when the DOM is ready:
//
// <!DOCTYPE html>
// <html><head>
// <meta charset="utf-8"/>
// ..
// <script type="text/javascript" src="js/load.js"></script>
// </head><body>
// <div id="main">Please enable JavaScript!  Bitte JavaScript einschalten!</div>
// ..
// <script src="js/onready.js"></script></body></html>

;(function(window){
  var n=0, ex=[], list=[window.onready];
  function run(fn) { if (fn) window.setTimeout(function(x){ try { fn(x,ex) } catch (e) { ex.push([fn,x,e]) } }, 0, n++) };
  window.onready = { push:run }
  while (list.length) { var a = list.shift(); if (a instanceof Array) list = a.concat(list); else run(a); }
})(self || window || this);

