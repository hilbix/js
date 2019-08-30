/// automatically generated from https://github.com/hilbix/js.git ///

/// js/ajax.js ///

// $Header$
//
// partly stolen at http://snippets.dzone.com/posts/show/2025
// Rest portion:
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

function $$$(e,s){e=$(e); e.innerHTML=s; return e};
function $$(e){return $(e).innerHTML};
function $(e){if(typeof e=='string')e=document.getElementById(e);return e};
var __aps = Array.prototype.slice;
function Ary(){var a=[];for(var i=0;i<arguments.length;i+=2)a=a.concat(__aps.call(arguments[i],arguments[i+1]?arguments[i+1]:0));return a}
function __(e){if(typeof e=='string')e=document.createElement(e);if(arguments.length>1){var x=__.apply(this,Ary(arguments,1));if(!(x instanceof Array))x=[x];for(var i=0; i<x.length; i++)e.appendChild(x[i])};return e};
function ___(e){var x=[];for(var i=0;i<arguments.length;i++){var e=arguments[i];if(typeof e=='string')e=document.createTextNode(e);x.push(e);}if(x.length==1)return x[0];return x};
function _a_(href,onclick){var a=__.apply(this,Ary(['a'],0,arguments,2));a.href=href;a.onclick=onclick;return a}

ajax={};
ajax.collect=function(a,f){var n=[];for(var i=0;i<a.length;i++){var v=f(a[i]);if(v!=null)n.push(v)}return n};
ajax.x=function(){try{return new XMLHttpRequest()}catch(e){try{return new ActiveXObject('Msxml2.XMLHTTP')}catch(e){return new ActiveXObject('Microsoft.XMLHTTP')}}};
ajax.send=function(u,f,m,a,h){var x=ajax.x();x.open(m,u,true);x.onreadystatechange=function(){if(x.readyState==4)f(x.responseText,x,x.status,x.getResponseHeader("Last-Modified"))};if(m=='POST')x.setRequestHeader('Content-type','application/x-www-form-urlencoded');if(h)h(x);x.send(a)};
ajax.get=function(url,func){ajax.send(url,func,'GET')};
ajax.update=function(u,f,lm){ajax.send(u,f,'GET',null,lm?function(x){x.setRequestHeader("If-Modified-Since",lm)}:lm)};
ajax.head=function(u,f,lm){ajax.send(u,f,'HEAD',null,lm?function(x){x.setRequestHeader("If-Modified-Since",lm)}:lm)};
//ajax.serialize=function(f){var g=function(n){return f.getElementsByTagName(n)};var nv=function(e){if(e.name)return encodeURIComponent(e.name)+'='+encodeURIComponent(e.value);else return ''};var i=ajax.collect(g('input'),function(i){if((i.type!='radio'&&i.type!='checkbox')||i.checked)return nv(i)});var s=ajax.collect(g('select'),nv);var t=ajax.collect(g('textarea'),nv);return i.concat(s).concat(t).join('&');};
//ajax.gets=function(url){var x=ajax.x();x.open('GET',url,false);x.send(null);return x.responseText};
ajax.post=function(url,func,args){ajax.send(url,func,'POST',args)};
//ajax.update=function(url,elm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.get(url,f)};
//ajax.submit=function(url,elm,frm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.post(url,f,ajax.serialize(frm))};


/// js/showhide.js ///

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

