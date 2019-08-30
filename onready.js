///STANDALONE
// Based on an idea presented in https://gist.github.com/shesek/441c02cf1f094c36f57a
//
// ;onready=[onready, YOUR_INIT_FUNCTION];
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

;(function(){
  var list=Array.prototype.slice.call([window.onready]);
  window.onready = { push: function(fn) { window.setTimeout(fn) } };
  if (list) for (var i=0; i<list.length; i++) if (list[i]) window.setTimeout(list[i]);
  else window.document.getElementById('main').innerHTML='JavaScript version not compatible or loading error!  <b>Sorry!</b>  Inkompatible JavaScript-Version oder Ladefehler!';
})();

