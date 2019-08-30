'use strict';
//require ajax.js

function hide(s)
{
  var e=$(s);
  if (e.style.display!="none")
    e.olddisplay = e.style.display;
  e.style.display="none";
}
function show(s)
{
  var e=$(s);
  if (e.style.display=="none")
    e.style.display = e.olddisplay;
}

