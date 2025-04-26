'use strict';	// This is for ES13 aka ES2022
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

// Minimalistic Debugger.  This needs es13.js
//
// - EDa to EDz and EDA to EDZ are predefined in the global environment.
// - Use ED$(singlearg) to get a length limited JSON output.
// - Do not leave away the ?. as seen below, these variables are void 0 (AKA undefined) when debugging is not enabled.
//
// Usage NodeJS:
//
//	DEBUG=100abc ./myscript.js
//
// with following in myscript.js:
//
//	const Debug	= require('ed13.js');
//	const DEBUG	= Debug`lib with more info`;	// EDEBUG=lib, but this also enabled EDl, EDi, EDb
//	DEBUG?.('hello world')
//	if (DEBUG) { /* do some extended debugging */ }
//
// Usage in Browser:
//
//	<script src="es13.js"></script>
//	<script type="module" src="ed13.js" data-debug="100abc"></script>
//
// in your script:
//
//	for (const _ of Array(101).fill()) EDa?.('hello world', _);
//
// The data-debug setting above enables EDa to EDc and throws after 100 debug outputs.
// (Leave the number away or set it 0 to prevent the throw.)


const	DEBUG	= process ? process.env?.EDEBUG : document?.currentScript?.dataset?.debug;
let	cnt	= -parseInt(DEBUG);		// if it starts with a number, then this is the maximum debug count where it throws
const	ED	= x => DEBUG && DEBUG.includes(mkArr(x)[0].split(' ',1)[0]) ? (...a) => { const _ = ++cnt; console.log('DEBUG', _, x, ...a); if (!_) throw 'max DEBUG cnt reached'; return _ } : void 0;

// XXX TODO XXX switch to not pollute the global Env

// Create EDa to EDz and EDA to EDZ in the global env
['az', 'AZ'].forEach(_ => Array.from(_, _ => _.charCodeAt(0)).forEach(([i,j]) => Array(j-i+1).fill().map((_,j) => String.fromCharCode(i+j)).forEach(_ => global[`DEBUG${_}`] = ED_(_))));
global.ED$	= _ => JSON.stringify(_).substr(0,1000);	// convert big data to limited output (perhaps customizable in future)

module.exports = ED;

