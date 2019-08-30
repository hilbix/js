///STANDALONE
// Based on an idea presented in https://gist.github.com/shesek/441c02cf1f094c36f57a
//
// ;window.onready=[window.onready, YOUR_INIT_FUNCTION];
//
// If HTML is written this way, it ensures, that YOUR_INIT_FUNCTION is called when the DOM is ready:
//
// <!DOCTYPE html>
// <html><head>
// <meta charset="utf-8"/>
// ..
// <script type="text/javascript" src="js/loader.js"></script>
// </head><body>
// <div id="main">Please enable JavaScript!  Bitte JavaScript einschalten!</div>
// ..
// <script src="js/onready.js"></script></body></html>

;(function(s){
  var n=0, ex='', list=[window.onready];
  window.onready = { push: function(fn) { window.setTimeout(fn) } };
  function run(fn) { if (fn) window.setTimeout(function(){ try { fn(); n++ } catch (e) { ex=e + ': ' + fn }}); };
  while (list.length) { var a = list.shift(); if (a instanceof Array) list = a.concat(list); else run(a); }
  run(function(){ if (!n || ex) window.document.getElementById('main').innerHTML=ex ? ex : s });
})('JavaScript version not compatible or loading error!  <b>Sorry!</b>  Inkompatible JavaScript-Version oder Ladefehler!');

