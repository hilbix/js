'use strict';
// Bundled by:
// script  babel.sh
// GIT     https://github.com/hilbix/js.git
// branch  es13dev
// src     d78239aa6c6c2c41b21b1103983d5acab0a5332332b7734529c58c5ebbc73bf0 cry/sha256c.js
// DEBUG   <script src="cry/sha256.js" data-debug></script>
require = (function(orig,cs, _)
  {
    var r = [];
    var debug = cs && cs.data && cs.data.debug;
    function require(x, p)
      {
        // relative paths
        if (x.substr(0,2)=='./' || x.substr(0,3)=='../')
          x = p + '/' + x;

        // canonicalize path
        x = x.split('/');
        p = [];
        while (x.length)
          {
            var t = x.shift();
            if (t=='' || t=='.') continue;
            if (t=='..') p.pop(); else p.push(t);
          }
        x = p.join('/');

        // if not bundled, forward to others
        if (!_[x])
          {
            if (debug)
              console.error('require(orig):', x);
            if (orig)
              return orig(x);
            throw 'require(): not found: '+x;
          }

        // include CommonJS module
        var m = { id:x, exports:{} };
        p = _[x][0];
        _[x][1](m, function(x) { return require(x, p) });

        if (debug)
          console.error('require(local):', x, p, m.exports);

        return m.exports;
      }
    return function(x) { return r[x] || (r[x]=require(x, '')) };
  })(this.window && window.require, this.document && document.currentScript,
{ "@babel/runtime/helpers/classCallCheck":["@babel/runtime/helpers", function(module,require) { // @babel/runtime/helpers/classCallCheck.js
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
}]
, "@babel/runtime/helpers/createClass":["@babel/runtime/helpers", function(module,require) { // @babel/runtime/helpers/createClass.js
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
}]
, "@babel/runtime/helpers/typeof":["@babel/runtime/helpers", function(module,require) { // @babel/runtime/helpers/typeof.js
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
}]
});
// BABEL   babeljs --source-type=script --presets @babel/preset-env --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-class-properties,@babel/plugin-transform-runtime cry/sha256c.js
// DO NOT EDIT. Automatically generated by ./unroll.sh sha256c.js.in
// src 841241e5be570e4e8c835af1fd1ffa803b727b4f24ee511e1390c6b3be404cdc sha256c.js.in
'use strict'; // This is free as in free beer, free speech and free baby.
// IMPORTANT!  NEVER COVER THIS CODE WITH A COPYRIGHT
// as this might break German Urheberrecht!
// If you need to state a Copyright, excempt this code from it!
//
// How to use?
//	<script src="sha256.js"></script>
// then
//	const shas256 = SHA256.md5('string');
// or
//	const shas256 = new SHA256();
//	const a = shas256.init().update_str('str1').update_str('str2').end().$hex;
//	const b = shas256.init().update8(new UInt8Array(something))   .end().$bin;
// This can be repeated:        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var _typeof = require("@babel/runtime/helpers/typeof");

var SHA256 = function (_) {
  return _();
}(function () {
  function D() {
    var p = [];

    for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
      a[_key] = arguments[_key];
    }

    var _loop = function _loop() {
      var x = _a[_i];
      if ('string' === typeof x) p.push(x);else if (_typeof(x) !== 'object') p.push("".concat(Number(x >>> 0).toString(16)).padStart(8, '0'));else if (x.BYTES_PER_ELEMENT) p.push(Array.from(x).map(function (_) {
        return _.toString(16).padStart(x.BYTES_PER_ELEMENT * 2, '0');
      }).join('_'));else p.push(JSON.stringify(x));
    };

    for (var _i = 0, _a = a; _i < _a.length; _i++) {
      _loop();
    }

    console.log(p.join('\n'));
    console.log('-------');
  } // Class layout analogous to md5c.js.in, for additional comments see there.
  // I need a stable independent reference code without additional dependencies.
  // Hence no inheritance (yet).  Perhaps future will bring a modular version.


  var SHA256 = /*#__PURE__*/function () {
    _createClass(SHA256, [{
      key: "big_endian",
      value: function big_endian() {
        var b = new ArrayBuffer(4);
        new Uint32Array(b)[0] = 0x12345678;
        return new Uint8Array(b)[0] === 0x12;
      }
    }]);

    function SHA256() {
      _classCallCheck(this, SHA256);

      var b = new ArrayBuffer(64);
      this.in8 = new Uint8Array(b);
      this.in32 = new Uint32Array(b);
      this.enc = new TextEncoder();
      this.trafo = this._trafo;
      if (!this.big_endian()) this.swap = this._swap;
    }

    _createClass(SHA256, [{
      key: "_swap",
      value: function _swap(a32) {
        for (var i = a32.length; --i >= 0;) {
          var x = a32[i];
          x = x >> 8 & 0x00ff00ff | x << 8 & 0xff00ff00;
          x = x >> 16 & 0x0000ffff | x << 16 & 0xffff0000;
          a32[i] = x;
        }
      } // XXX bis hier korrekt
      ///////////////////////

    }, {
      key: "_trafo",
      value: function _trafo() {
        var ctx = this.buf;
        var buf = this.in32;
        var v0 = buf[0] | 0;
        var v1 = buf[1] | 0;
        var v2 = buf[2] | 0;
        var v3 = buf[3] | 0;
        var v4 = buf[4] | 0;
        var v5 = buf[5] | 0;
        var v6 = buf[6] | 0;
        var v7 = buf[7] | 0;
        var v8 = buf[8] | 0;
        var v9 = buf[9] | 0;
        var v10 = buf[10] | 0;
        var v11 = buf[11] | 0;
        var v12 = buf[12] | 0;
        var v13 = buf[13] | 0;
        var v14 = buf[14] | 0;
        var v15 = buf[15] | 0;
        var a = ctx[0];
        var b = ctx[1];
        var c = ctx[2];
        var d = ctx[3];
        var e = ctx[4];
        var f = ctx[5];
        var g = ctx[6];
        var h = ctx[7];
        h = h + v0 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0x428a2f98 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        g = g + v1 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0x71374491 | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        f = f + v2 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0xb5c0fbcf | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        e = e + v3 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0xe9b5dba5 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        d = d + v4 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0x3956c25b | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        c = c + v5 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0x59f111f1 | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        b = b + v6 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0x923f82a4 | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        a = a + v7 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0xab1c5ed5 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        h = h + v8 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0xd807aa98 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        g = g + v9 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0x12835b01 | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        f = f + v10 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0x243185be | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        e = e + v11 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0x550c7dc3 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        d = d + v12 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0x72be5d74 | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        c = c + v13 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0x80deb1fe | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        b = b + v14 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0x9bdc06a7 | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        a = a + v15 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0xc19bf174 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        v0 = v0 + (v1 >>> 7 ^ v1 >>> 18 ^ v1 >>> 3 ^ v1 << 25 ^ v1 << 14) + (v14 >>> 17 ^ v14 >>> 19 ^ v14 >>> 10 ^ v14 << 15 ^ v14 << 13) + v9 | 0;
        h = h + v0 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0xe49b69c1 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        v1 = v1 + (v2 >>> 7 ^ v2 >>> 18 ^ v2 >>> 3 ^ v2 << 25 ^ v2 << 14) + (v15 >>> 17 ^ v15 >>> 19 ^ v15 >>> 10 ^ v15 << 15 ^ v15 << 13) + v10 | 0;
        g = g + v1 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0xefbe4786 | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        v2 = v2 + (v3 >>> 7 ^ v3 >>> 18 ^ v3 >>> 3 ^ v3 << 25 ^ v3 << 14) + (v0 >>> 17 ^ v0 >>> 19 ^ v0 >>> 10 ^ v0 << 15 ^ v0 << 13) + v11 | 0;
        f = f + v2 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0x0fc19dc6 | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        v3 = v3 + (v4 >>> 7 ^ v4 >>> 18 ^ v4 >>> 3 ^ v4 << 25 ^ v4 << 14) + (v1 >>> 17 ^ v1 >>> 19 ^ v1 >>> 10 ^ v1 << 15 ^ v1 << 13) + v12 | 0;
        e = e + v3 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0x240ca1cc | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        v4 = v4 + (v5 >>> 7 ^ v5 >>> 18 ^ v5 >>> 3 ^ v5 << 25 ^ v5 << 14) + (v2 >>> 17 ^ v2 >>> 19 ^ v2 >>> 10 ^ v2 << 15 ^ v2 << 13) + v13 | 0;
        d = d + v4 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0x2de92c6f | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        v5 = v5 + (v6 >>> 7 ^ v6 >>> 18 ^ v6 >>> 3 ^ v6 << 25 ^ v6 << 14) + (v3 >>> 17 ^ v3 >>> 19 ^ v3 >>> 10 ^ v3 << 15 ^ v3 << 13) + v14 | 0;
        c = c + v5 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0x4a7484aa | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        v6 = v6 + (v7 >>> 7 ^ v7 >>> 18 ^ v7 >>> 3 ^ v7 << 25 ^ v7 << 14) + (v4 >>> 17 ^ v4 >>> 19 ^ v4 >>> 10 ^ v4 << 15 ^ v4 << 13) + v15 | 0;
        b = b + v6 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0x5cb0a9dc | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        v7 = v7 + (v8 >>> 7 ^ v8 >>> 18 ^ v8 >>> 3 ^ v8 << 25 ^ v8 << 14) + (v5 >>> 17 ^ v5 >>> 19 ^ v5 >>> 10 ^ v5 << 15 ^ v5 << 13) + v0 | 0;
        a = a + v7 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0x76f988da | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        v8 = v8 + (v9 >>> 7 ^ v9 >>> 18 ^ v9 >>> 3 ^ v9 << 25 ^ v9 << 14) + (v6 >>> 17 ^ v6 >>> 19 ^ v6 >>> 10 ^ v6 << 15 ^ v6 << 13) + v1 | 0;
        h = h + v8 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0x983e5152 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        v9 = v9 + (v10 >>> 7 ^ v10 >>> 18 ^ v10 >>> 3 ^ v10 << 25 ^ v10 << 14) + (v7 >>> 17 ^ v7 >>> 19 ^ v7 >>> 10 ^ v7 << 15 ^ v7 << 13) + v2 | 0;
        g = g + v9 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0xa831c66d | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        v10 = v10 + (v11 >>> 7 ^ v11 >>> 18 ^ v11 >>> 3 ^ v11 << 25 ^ v11 << 14) + (v8 >>> 17 ^ v8 >>> 19 ^ v8 >>> 10 ^ v8 << 15 ^ v8 << 13) + v3 | 0;
        f = f + v10 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0xb00327c8 | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        v11 = v11 + (v12 >>> 7 ^ v12 >>> 18 ^ v12 >>> 3 ^ v12 << 25 ^ v12 << 14) + (v9 >>> 17 ^ v9 >>> 19 ^ v9 >>> 10 ^ v9 << 15 ^ v9 << 13) + v4 | 0;
        e = e + v11 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0xbf597fc7 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        v12 = v12 + (v13 >>> 7 ^ v13 >>> 18 ^ v13 >>> 3 ^ v13 << 25 ^ v13 << 14) + (v10 >>> 17 ^ v10 >>> 19 ^ v10 >>> 10 ^ v10 << 15 ^ v10 << 13) + v5 | 0;
        d = d + v12 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0xc6e00bf3 | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        v13 = v13 + (v14 >>> 7 ^ v14 >>> 18 ^ v14 >>> 3 ^ v14 << 25 ^ v14 << 14) + (v11 >>> 17 ^ v11 >>> 19 ^ v11 >>> 10 ^ v11 << 15 ^ v11 << 13) + v6 | 0;
        c = c + v13 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0xd5a79147 | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        v14 = v14 + (v15 >>> 7 ^ v15 >>> 18 ^ v15 >>> 3 ^ v15 << 25 ^ v15 << 14) + (v12 >>> 17 ^ v12 >>> 19 ^ v12 >>> 10 ^ v12 << 15 ^ v12 << 13) + v7 | 0;
        b = b + v14 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0x06ca6351 | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        v15 = v15 + (v0 >>> 7 ^ v0 >>> 18 ^ v0 >>> 3 ^ v0 << 25 ^ v0 << 14) + (v13 >>> 17 ^ v13 >>> 19 ^ v13 >>> 10 ^ v13 << 15 ^ v13 << 13) + v8 | 0;
        a = a + v15 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0x14292967 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        v0 = v0 + (v1 >>> 7 ^ v1 >>> 18 ^ v1 >>> 3 ^ v1 << 25 ^ v1 << 14) + (v14 >>> 17 ^ v14 >>> 19 ^ v14 >>> 10 ^ v14 << 15 ^ v14 << 13) + v9 | 0;
        h = h + v0 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0x27b70a85 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        v1 = v1 + (v2 >>> 7 ^ v2 >>> 18 ^ v2 >>> 3 ^ v2 << 25 ^ v2 << 14) + (v15 >>> 17 ^ v15 >>> 19 ^ v15 >>> 10 ^ v15 << 15 ^ v15 << 13) + v10 | 0;
        g = g + v1 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0x2e1b2138 | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        v2 = v2 + (v3 >>> 7 ^ v3 >>> 18 ^ v3 >>> 3 ^ v3 << 25 ^ v3 << 14) + (v0 >>> 17 ^ v0 >>> 19 ^ v0 >>> 10 ^ v0 << 15 ^ v0 << 13) + v11 | 0;
        f = f + v2 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0x4d2c6dfc | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        v3 = v3 + (v4 >>> 7 ^ v4 >>> 18 ^ v4 >>> 3 ^ v4 << 25 ^ v4 << 14) + (v1 >>> 17 ^ v1 >>> 19 ^ v1 >>> 10 ^ v1 << 15 ^ v1 << 13) + v12 | 0;
        e = e + v3 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0x53380d13 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        v4 = v4 + (v5 >>> 7 ^ v5 >>> 18 ^ v5 >>> 3 ^ v5 << 25 ^ v5 << 14) + (v2 >>> 17 ^ v2 >>> 19 ^ v2 >>> 10 ^ v2 << 15 ^ v2 << 13) + v13 | 0;
        d = d + v4 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0x650a7354 | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        v5 = v5 + (v6 >>> 7 ^ v6 >>> 18 ^ v6 >>> 3 ^ v6 << 25 ^ v6 << 14) + (v3 >>> 17 ^ v3 >>> 19 ^ v3 >>> 10 ^ v3 << 15 ^ v3 << 13) + v14 | 0;
        c = c + v5 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0x766a0abb | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        v6 = v6 + (v7 >>> 7 ^ v7 >>> 18 ^ v7 >>> 3 ^ v7 << 25 ^ v7 << 14) + (v4 >>> 17 ^ v4 >>> 19 ^ v4 >>> 10 ^ v4 << 15 ^ v4 << 13) + v15 | 0;
        b = b + v6 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0x81c2c92e | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        v7 = v7 + (v8 >>> 7 ^ v8 >>> 18 ^ v8 >>> 3 ^ v8 << 25 ^ v8 << 14) + (v5 >>> 17 ^ v5 >>> 19 ^ v5 >>> 10 ^ v5 << 15 ^ v5 << 13) + v0 | 0;
        a = a + v7 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0x92722c85 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        v8 = v8 + (v9 >>> 7 ^ v9 >>> 18 ^ v9 >>> 3 ^ v9 << 25 ^ v9 << 14) + (v6 >>> 17 ^ v6 >>> 19 ^ v6 >>> 10 ^ v6 << 15 ^ v6 << 13) + v1 | 0;
        h = h + v8 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0xa2bfe8a1 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        v9 = v9 + (v10 >>> 7 ^ v10 >>> 18 ^ v10 >>> 3 ^ v10 << 25 ^ v10 << 14) + (v7 >>> 17 ^ v7 >>> 19 ^ v7 >>> 10 ^ v7 << 15 ^ v7 << 13) + v2 | 0;
        g = g + v9 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0xa81a664b | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        v10 = v10 + (v11 >>> 7 ^ v11 >>> 18 ^ v11 >>> 3 ^ v11 << 25 ^ v11 << 14) + (v8 >>> 17 ^ v8 >>> 19 ^ v8 >>> 10 ^ v8 << 15 ^ v8 << 13) + v3 | 0;
        f = f + v10 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0xc24b8b70 | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        v11 = v11 + (v12 >>> 7 ^ v12 >>> 18 ^ v12 >>> 3 ^ v12 << 25 ^ v12 << 14) + (v9 >>> 17 ^ v9 >>> 19 ^ v9 >>> 10 ^ v9 << 15 ^ v9 << 13) + v4 | 0;
        e = e + v11 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0xc76c51a3 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        v12 = v12 + (v13 >>> 7 ^ v13 >>> 18 ^ v13 >>> 3 ^ v13 << 25 ^ v13 << 14) + (v10 >>> 17 ^ v10 >>> 19 ^ v10 >>> 10 ^ v10 << 15 ^ v10 << 13) + v5 | 0;
        d = d + v12 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0xd192e819 | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        v13 = v13 + (v14 >>> 7 ^ v14 >>> 18 ^ v14 >>> 3 ^ v14 << 25 ^ v14 << 14) + (v11 >>> 17 ^ v11 >>> 19 ^ v11 >>> 10 ^ v11 << 15 ^ v11 << 13) + v6 | 0;
        c = c + v13 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0xd6990624 | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        v14 = v14 + (v15 >>> 7 ^ v15 >>> 18 ^ v15 >>> 3 ^ v15 << 25 ^ v15 << 14) + (v12 >>> 17 ^ v12 >>> 19 ^ v12 >>> 10 ^ v12 << 15 ^ v12 << 13) + v7 | 0;
        b = b + v14 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0xf40e3585 | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        v15 = v15 + (v0 >>> 7 ^ v0 >>> 18 ^ v0 >>> 3 ^ v0 << 25 ^ v0 << 14) + (v13 >>> 17 ^ v13 >>> 19 ^ v13 >>> 10 ^ v13 << 15 ^ v13 << 13) + v8 | 0;
        a = a + v15 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0x106aa070 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        v0 = v0 + (v1 >>> 7 ^ v1 >>> 18 ^ v1 >>> 3 ^ v1 << 25 ^ v1 << 14) + (v14 >>> 17 ^ v14 >>> 19 ^ v14 >>> 10 ^ v14 << 15 ^ v14 << 13) + v9 | 0;
        h = h + v0 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0x19a4c116 | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        v1 = v1 + (v2 >>> 7 ^ v2 >>> 18 ^ v2 >>> 3 ^ v2 << 25 ^ v2 << 14) + (v15 >>> 17 ^ v15 >>> 19 ^ v15 >>> 10 ^ v15 << 15 ^ v15 << 13) + v10 | 0;
        g = g + v1 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0x1e376c08 | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        v2 = v2 + (v3 >>> 7 ^ v3 >>> 18 ^ v3 >>> 3 ^ v3 << 25 ^ v3 << 14) + (v0 >>> 17 ^ v0 >>> 19 ^ v0 >>> 10 ^ v0 << 15 ^ v0 << 13) + v11 | 0;
        f = f + v2 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0x2748774c | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        v3 = v3 + (v4 >>> 7 ^ v4 >>> 18 ^ v4 >>> 3 ^ v4 << 25 ^ v4 << 14) + (v1 >>> 17 ^ v1 >>> 19 ^ v1 >>> 10 ^ v1 << 15 ^ v1 << 13) + v12 | 0;
        e = e + v3 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0x34b0bcb5 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        v4 = v4 + (v5 >>> 7 ^ v5 >>> 18 ^ v5 >>> 3 ^ v5 << 25 ^ v5 << 14) + (v2 >>> 17 ^ v2 >>> 19 ^ v2 >>> 10 ^ v2 << 15 ^ v2 << 13) + v13 | 0;
        d = d + v4 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0x391c0cb3 | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        v5 = v5 + (v6 >>> 7 ^ v6 >>> 18 ^ v6 >>> 3 ^ v6 << 25 ^ v6 << 14) + (v3 >>> 17 ^ v3 >>> 19 ^ v3 >>> 10 ^ v3 << 15 ^ v3 << 13) + v14 | 0;
        c = c + v5 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0x4ed8aa4a | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        v6 = v6 + (v7 >>> 7 ^ v7 >>> 18 ^ v7 >>> 3 ^ v7 << 25 ^ v7 << 14) + (v4 >>> 17 ^ v4 >>> 19 ^ v4 >>> 10 ^ v4 << 15 ^ v4 << 13) + v15 | 0;
        b = b + v6 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0x5b9cca4f | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        v7 = v7 + (v8 >>> 7 ^ v8 >>> 18 ^ v8 >>> 3 ^ v8 << 25 ^ v8 << 14) + (v5 >>> 17 ^ v5 >>> 19 ^ v5 >>> 10 ^ v5 << 15 ^ v5 << 13) + v0 | 0;
        a = a + v7 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0x682e6ff3 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        v8 = v8 + (v9 >>> 7 ^ v9 >>> 18 ^ v9 >>> 3 ^ v9 << 25 ^ v9 << 14) + (v6 >>> 17 ^ v6 >>> 19 ^ v6 >>> 10 ^ v6 << 15 ^ v6 << 13) + v1 | 0;
        h = h + v8 + (e >>> 6 ^ e >>> 11 ^ e >>> 25 ^ e << 26 ^ e << 21 ^ e << 7) + (g ^ e & (f ^ g)) + 0x748f82ee | 0;
        d = d + h | 0;
        h = h + (a & b ^ c & (a ^ b)) + (a >>> 2 ^ a >>> 13 ^ a >>> 22 ^ a << 30 ^ a << 19 ^ a << 10) | 0;
        v9 = v9 + (v10 >>> 7 ^ v10 >>> 18 ^ v10 >>> 3 ^ v10 << 25 ^ v10 << 14) + (v7 >>> 17 ^ v7 >>> 19 ^ v7 >>> 10 ^ v7 << 15 ^ v7 << 13) + v2 | 0;
        g = g + v9 + (d >>> 6 ^ d >>> 11 ^ d >>> 25 ^ d << 26 ^ d << 21 ^ d << 7) + (f ^ d & (e ^ f)) + 0x78a5636f | 0;
        c = c + g | 0;
        g = g + (h & a ^ b & (h ^ a)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
        v10 = v10 + (v11 >>> 7 ^ v11 >>> 18 ^ v11 >>> 3 ^ v11 << 25 ^ v11 << 14) + (v8 >>> 17 ^ v8 >>> 19 ^ v8 >>> 10 ^ v8 << 15 ^ v8 << 13) + v3 | 0;
        f = f + v10 + (c >>> 6 ^ c >>> 11 ^ c >>> 25 ^ c << 26 ^ c << 21 ^ c << 7) + (e ^ c & (d ^ e)) + 0x84c87814 | 0;
        b = b + f | 0;
        f = f + (g & h ^ a & (g ^ h)) + (g >>> 2 ^ g >>> 13 ^ g >>> 22 ^ g << 30 ^ g << 19 ^ g << 10) | 0;
        v11 = v11 + (v12 >>> 7 ^ v12 >>> 18 ^ v12 >>> 3 ^ v12 << 25 ^ v12 << 14) + (v9 >>> 17 ^ v9 >>> 19 ^ v9 >>> 10 ^ v9 << 15 ^ v9 << 13) + v4 | 0;
        e = e + v11 + (b >>> 6 ^ b >>> 11 ^ b >>> 25 ^ b << 26 ^ b << 21 ^ b << 7) + (d ^ b & (c ^ d)) + 0x8cc70208 | 0;
        a = a + e | 0;
        e = e + (f & g ^ h & (f ^ g)) + (f >>> 2 ^ f >>> 13 ^ f >>> 22 ^ f << 30 ^ f << 19 ^ f << 10) | 0;
        v12 = v12 + (v13 >>> 7 ^ v13 >>> 18 ^ v13 >>> 3 ^ v13 << 25 ^ v13 << 14) + (v10 >>> 17 ^ v10 >>> 19 ^ v10 >>> 10 ^ v10 << 15 ^ v10 << 13) + v5 | 0;
        d = d + v12 + (a >>> 6 ^ a >>> 11 ^ a >>> 25 ^ a << 26 ^ a << 21 ^ a << 7) + (c ^ a & (b ^ c)) + 0x90befffa | 0;
        h = h + d | 0;
        d = d + (e & f ^ g & (e ^ f)) + (e >>> 2 ^ e >>> 13 ^ e >>> 22 ^ e << 30 ^ e << 19 ^ e << 10) | 0;
        v13 = v13 + (v14 >>> 7 ^ v14 >>> 18 ^ v14 >>> 3 ^ v14 << 25 ^ v14 << 14) + (v11 >>> 17 ^ v11 >>> 19 ^ v11 >>> 10 ^ v11 << 15 ^ v11 << 13) + v6 | 0;
        c = c + v13 + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (b ^ h & (a ^ b)) + 0xa4506ceb | 0;
        g = g + c | 0;
        c = c + (d & e ^ f & (d ^ e)) + (d >>> 2 ^ d >>> 13 ^ d >>> 22 ^ d << 30 ^ d << 19 ^ d << 10) | 0;
        v14 = v14 + (v15 >>> 7 ^ v15 >>> 18 ^ v15 >>> 3 ^ v15 << 25 ^ v15 << 14) + (v12 >>> 17 ^ v12 >>> 19 ^ v12 >>> 10 ^ v12 << 15 ^ v12 << 13) + v7 | 0;
        b = b + v14 + (g >>> 6 ^ g >>> 11 ^ g >>> 25 ^ g << 26 ^ g << 21 ^ g << 7) + (a ^ g & (h ^ a)) + 0xbef9a3f7 | 0;
        f = f + b | 0;
        b = b + (c & d ^ e & (c ^ d)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10) | 0;
        v15 = v15 + (v0 >>> 7 ^ v0 >>> 18 ^ v0 >>> 3 ^ v0 << 25 ^ v0 << 14) + (v13 >>> 17 ^ v13 >>> 19 ^ v13 >>> 10 ^ v13 << 15 ^ v13 << 13) + v8 | 0;
        a = a + v15 + (f >>> 6 ^ f >>> 11 ^ f >>> 25 ^ f << 26 ^ f << 21 ^ f << 7) + (h ^ f & (g ^ h)) + 0xc67178f2 | 0;
        e = e + a | 0;
        a = a + (b & c ^ d & (b ^ c)) + (b >>> 2 ^ b >>> 13 ^ b >>> 22 ^ b << 30 ^ b << 19 ^ b << 10) | 0;
        ctx[0] = ctx[0] + a | 0;
        ctx[1] = ctx[1] + b | 0;
        ctx[2] = ctx[2] + c | 0;
        ctx[3] = ctx[3] + d | 0;
        ctx[4] = ctx[4] + e | 0;
        ctx[5] = ctx[5] + f | 0;
        ctx[6] = ctx[6] + g | 0;
        ctx[7] = ctx[7] + h | 0;
        this.len += 64;
      }
    }, {
      key: "init",
      value: function init() {
        this.buf = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
        this.fill = 0; // fill state of this.in

        this.len = 0; // total bytes transformed into hash so far

        return this;
      }
    }, {
      key: "end",
      value: function end() {
        var pos = this.fill;
        var len = (this.len + pos) * 8; // bytes

        var in8 = this.in8;
        var in32 = this.in32; // there is at least 1 byte free in this.in8

        in8[pos] = 0x80;
        var rest = 64 - 1 - pos; // The last 8 byte of the block will be overwritten below

        for (var i = rest; --i >= 0; in8[++pos] = 0) {
          ;
        }

        if (this.swap) this.swap(this.in32);

        if (rest < 8) {
          this.trafo();

          for (var _i2 = 14; --_i2 >= 0; in32[_i2] = 0) {
            ;
          }
        }

        in32[14] = len / 0x100000000 | 0; // we cannot use integer math here

        in32[15] = len >>> 0;
        this.trafo();
        this.fill = void 0;
        this.len = void 0; // this.buf contains the result

        if (this.swap) this.swap(this.buf);
        return this;
      } //////////////////////
      // XXX ab hier vermutlich korrekt

    }, {
      key: "update8",
      value: function update8(b) // Uint8Array
      {
        var _ = this.in8;
        var out = this.fill | 0;
        var len = b.length | 0; // we do not support more than 2^32 bytes (AKA 4GiB) per update

        var pos = 0;

        while (len) {
          var max = 64 - out | 0;
          if (max > len) max = len | 0; // To avoid the swap() on Big endian machines, following copy
          // should rather be replaced by some inlined Duff's device.
          // (for this we need to add up/down-counting repeats to ./unroll.sh)
          // (and we probably need conditional macros as well as recursive ones)

          _.set(b.subarray(pos, pos + max), out);

          pos = pos + max | 0;
          out = out + max | 0;
          len = len - max | 0;
          if (out < 64) break;
          if (this.swap) this.swap(this.in32);
          this.trafo();
          out = 0;
        }

        this.fill = out;
        return this;
      }
    }, {
      key: "update_str",
      value: function update_str(s) // this is not meant for long strings!
      {
        return this.update8(this.enc.encode(s));
      }
    }, {
      key: "$bin",
      get: function get() {
        return new Uint8Array(this.buf);
      }
    }, {
      key: "$hex",
      get: function get() {
        return Buffer.from(this.buf.buffer).toString('hex');
      }
    }], [{
      key: "sha256",
      value: function sha256(s, bin) {
        var out = _sha.init().update_str(s).end();

        return bin ? out.$bin : out.$hex;
      }
    }, {
      key: "test",
      value: function test(d, t) {
        var r = this.sha256(t);
        if (r !== d) throw "sha256c.js test failed for '".concat(t, "':\n'").concat(d, "' expected\n'").concat(r, "' got"); //        D('test ok', r);
      }
    }]);

    return SHA256;
  }();

  ;

  var _sha = new SHA256(); // for the static sha256 above


  SHA256.test('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', ''); // 0 bytes

  SHA256.test('72fa96f64bf2dd082aafb08cf80ed17f5b3d2c6cd527c4b138b69506f5e5c173', '0123456789abcdef0123456789abcdef0123456789abcdef0123456'); // single round

  SHA256.test('67e4026bfbe6f1cd3f40518f324bcdf4426ae00faf5a0cddeae67a0e60ecf665', '0123456789abcdef0123456789abcdef0123456789abcdef01234567'); // double round

  SHA256.test('a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'); // 64 byte input
  //  console.log('selftest ok');

  return SHA256;
});
