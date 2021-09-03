///STANDALONE
// Compatible to idea presented in https://gist.github.com/shesek/441c02cf1f094c36f57a
//
// ;window.onready=[window.onready, YOUR_INIT_FUNCTION];
// ;window.onready=[window.onready].push(YOUR_INIT_FUNCTION);
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
  var n=0, ex=[];
  run();
  function run()
    {
      var fn, list=[window.onready]; window.onready=[];
      while (list.length)
        if (fn = list.shift())
          if (fn instanceof Array) list=fn.concat(list);
          else window.setTimeout(function(f,x) {
            var e;
            try { f(x,ex) } catch (e) { ex.push([f,x,e]) };
            run()
            }, 0, fn, n++)
    }
})(self || window || this);

