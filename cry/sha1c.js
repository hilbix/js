// DO NOT EDIT. Automatically generated by ./unroll.sh sha1c.js.in
// src 3cfb85002f75017e4b1c72832cc9595a2a79220c98ca7b9889b765dbec2c5ba9 sha1c.js.in
'use strict';
// This is free as in free beer, free speech and free baby.
// IMPORTANT!  NEVER COVER THIS CODE WITH A COPYRIGHT
// as this might break German Urheberrecht!
// If you need to state a Copyright, excempt this code from it!
//
// How to use?
//	<script src="sha1.js"></script>
// then
//	const sha1 = SHA1.sha1('string');
// or
//	const sha1s = new SHA1();
//	const a = sha1s.init().update_str('str1').update_str('str2').end().$hex;
//	const b = sha1s.init().update8(new UInt8Array(something))   .end().$bin;
// This can be repeated:        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const SHA1 = (_=>_())(() => {
  function D(...a)
    {
      const p = [];
      for (const x of a)
        {
           if ('string' === typeof x)
             p.push(x);
           else if (typeof x !== 'object')
             p.push(`${Number(x>>>0).toString(16)}`.padStart(8,'0'));
           else if (x.BYTES_PER_ELEMENT)
             p.push(Array.from(x).map(_ => _.toString(16).padStart(x.BYTES_PER_ELEMENT*2, '0')).join('_'));
           else
             p.push(JSON.stringify(x));
        }
      console.log(p.join('\n'));
      console.log('-------');
    }
  // Class layout analogous to md5c.js.in, for additional comments see there.
  // I need a stable independent reference code without additional dependencies.
  // Hence no inheritance (yet).  Perhaps future will bring a modular version.
  class SHA1
    {
    big_endian()
      {
        const b	= new ArrayBuffer(4);
        new Uint32Array(b)[0]	= 0x12345678;
        return new Uint8Array(b)[0] === 0x12;
      }
    constructor()
      {
        const b		= new ArrayBuffer(64);
        this.in8	= new Uint8Array(b);
        this.in32	= new Uint32Array(b);
        this.enc	= new TextEncoder();
        this.trafo	= this._trafo;
        if (!this.big_endian())
          this.swap	= this._swap;
      }
    _swap(a32)
      {
        for (let i = a32.length; --i>=0; )
          {
            let x	= a32[i];
            x = ((x>> 8) & 0x00ff00ff) | ((x<< 8) & 0xff00ff00);
            x = ((x>>16) & 0x0000ffff) | ((x<<16) & 0xffff0000);
            a32[i]	= x;
          }
      }
///////////////////////
    _trafo()
      {
        const ctx	= this.buf;
        const buf	= this.in32;
	let n, t;
let v0 = buf[0] | 0, v20, v40, v60;
let v1 = buf[1] | 0, v21, v41, v61;
let v2 = buf[2] | 0, v22, v42, v62;
let v3 = buf[3] | 0, v23, v43, v63;
let v4 = buf[4] | 0, v24, v44, v64;
let v5 = buf[5] | 0, v25, v45, v65;
let v6 = buf[6] | 0, v26, v46, v66;
let v7 = buf[7] | 0, v27, v47, v67;
let v8 = buf[8] | 0, v28, v48, v68;
let v9 = buf[9] | 0, v29, v49, v69;
let v10 = buf[10] | 0, v30, v50, v70;
let v11 = buf[11] | 0, v31, v51, v71;
let v12 = buf[12] | 0, v32, v52, v72;
let v13 = buf[13] | 0, v33, v53, v73;
let v14 = buf[14] | 0, v34, v54, v74;
let v15 = buf[15] | 0, v35, v55, v75;
let v16,               v36, v56, v76;
let v17,               v37, v57, v77;
let v18,               v38, v58, v78;
let v19,               v39, v59, v79;
let a = ctx[0];
let b = ctx[1];
let c = ctx[2];
let d = ctx[3];
let e = ctx[4];
t = (v0 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v1 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v2 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v3 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v4 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v5 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v6 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v7 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v8 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v9 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v10 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v11 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v12 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v13 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v14 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = (v15 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v13 ^ v8 ^ v2 ^ v0;
v16 = (t << 1) | (t >>> 31);
t = (v16 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v14 ^ v9 ^ v3 ^ v1;
v17 = (t << 1) | (t >>> 31);
t = (v17 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v15 ^ v10 ^ v4 ^ v2;
v18 = (t << 1) | (t >>> 31);
t = (v18 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v16 ^ v11 ^ v5 ^ v3;
v19 = (t << 1) | (t >>> 31);
t = (v19 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (~b & d)) + 0x5a827999 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v17 ^ v12 ^ v6 ^ v4;
v20 = (t << 1) | (t >>> 31);
t = (v20 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v18 ^ v13 ^ v7 ^ v5;
v21 = (t << 1) | (t >>> 31);
t = (v21 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v19 ^ v14 ^ v8 ^ v6;
v22 = (t << 1) | (t >>> 31);
t = (v22 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v20 ^ v15 ^ v9 ^ v7;
v23 = (t << 1) | (t >>> 31);
t = (v23 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v21 ^ v16 ^ v10 ^ v8;
v24 = (t << 1) | (t >>> 31);
t = (v24 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v22 ^ v17 ^ v11 ^ v9;
v25 = (t << 1) | (t >>> 31);
t = (v25 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v23 ^ v18 ^ v12 ^ v10;
v26 = (t << 1) | (t >>> 31);
t = (v26 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v24 ^ v19 ^ v13 ^ v11;
v27 = (t << 1) | (t >>> 31);
t = (v27 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v25 ^ v20 ^ v14 ^ v12;
v28 = (t << 1) | (t >>> 31);
t = (v28 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v26 ^ v21 ^ v15 ^ v13;
v29 = (t << 1) | (t >>> 31);
t = (v29 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v27 ^ v22 ^ v16 ^ v14;
v30 = (t << 1) | (t >>> 31);
t = (v30 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v28 ^ v23 ^ v17 ^ v15;
v31 = (t << 1) | (t >>> 31);
t = (v31 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v29 ^ v24 ^ v18 ^ v16;
v32 = (t << 1) | (t >>> 31);
t = (v32 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v30 ^ v25 ^ v19 ^ v17;
v33 = (t << 1) | (t >>> 31);
t = (v33 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v31 ^ v26 ^ v20 ^ v18;
v34 = (t << 1) | (t >>> 31);
t = (v34 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v32 ^ v27 ^ v21 ^ v19;
v35 = (t << 1) | (t >>> 31);
t = (v35 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v33 ^ v28 ^ v22 ^ v20;
v36 = (t << 1) | (t >>> 31);
t = (v36 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v34 ^ v29 ^ v23 ^ v21;
v37 = (t << 1) | (t >>> 31);
t = (v37 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v35 ^ v30 ^ v24 ^ v22;
v38 = (t << 1) | (t >>> 31);
t = (v38 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v36 ^ v31 ^ v25 ^ v23;
v39 = (t << 1) | (t >>> 31);
t = (v39 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) + 0x6ed9eba1 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v37 ^ v32 ^ v26 ^ v24;
v40 = (t << 1) | (t >>> 31);
t = (v40 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v38 ^ v33 ^ v27 ^ v25;
v41 = (t << 1) | (t >>> 31);
t = (v41 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v39 ^ v34 ^ v28 ^ v26;
v42 = (t << 1) | (t >>> 31);
t = (v42 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v40 ^ v35 ^ v29 ^ v27;
v43 = (t << 1) | (t >>> 31);
t = (v43 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v41 ^ v36 ^ v30 ^ v28;
v44 = (t << 1) | (t >>> 31);
t = (v44 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v42 ^ v37 ^ v31 ^ v29;
v45 = (t << 1) | (t >>> 31);
t = (v45 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v43 ^ v38 ^ v32 ^ v30;
v46 = (t << 1) | (t >>> 31);
t = (v46 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v44 ^ v39 ^ v33 ^ v31;
v47 = (t << 1) | (t >>> 31);
t = (v47 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v45 ^ v40 ^ v34 ^ v32;
v48 = (t << 1) | (t >>> 31);
t = (v48 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v46 ^ v41 ^ v35 ^ v33;
v49 = (t << 1) | (t >>> 31);
t = (v49 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v47 ^ v42 ^ v36 ^ v34;
v50 = (t << 1) | (t >>> 31);
t = (v50 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v48 ^ v43 ^ v37 ^ v35;
v51 = (t << 1) | (t >>> 31);
t = (v51 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v49 ^ v44 ^ v38 ^ v36;
v52 = (t << 1) | (t >>> 31);
t = (v52 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v50 ^ v45 ^ v39 ^ v37;
v53 = (t << 1) | (t >>> 31);
t = (v53 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v51 ^ v46 ^ v40 ^ v38;
v54 = (t << 1) | (t >>> 31);
t = (v54 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v52 ^ v47 ^ v41 ^ v39;
v55 = (t << 1) | (t >>> 31);
t = (v55 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v53 ^ v48 ^ v42 ^ v40;
v56 = (t << 1) | (t >>> 31);
t = (v56 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v54 ^ v49 ^ v43 ^ v41;
v57 = (t << 1) | (t >>> 31);
t = (v57 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v55 ^ v50 ^ v44 ^ v42;
v58 = (t << 1) | (t >>> 31);
t = (v58 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v56 ^ v51 ^ v45 ^ v43;
v59 = (t << 1) | (t >>> 31);
t = (v59 + ((a << 5) | (a >>> 27)) + e + ((b & c) | (b & d) | (c & d)) - 0x70e44324 )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v57 ^ v52 ^ v46 ^ v44;
v60 = (t << 1) | (t >>> 31);
t = (v60 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v58 ^ v53 ^ v47 ^ v45;
v61 = (t << 1) | (t >>> 31);
t = (v61 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v59 ^ v54 ^ v48 ^ v46;
v62 = (t << 1) | (t >>> 31);
t = (v62 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v60 ^ v55 ^ v49 ^ v47;
v63 = (t << 1) | (t >>> 31);
t = (v63 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v61 ^ v56 ^ v50 ^ v48;
v64 = (t << 1) | (t >>> 31);
t = (v64 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v62 ^ v57 ^ v51 ^ v49;
v65 = (t << 1) | (t >>> 31);
t = (v65 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v63 ^ v58 ^ v52 ^ v50;
v66 = (t << 1) | (t >>> 31);
t = (v66 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v64 ^ v59 ^ v53 ^ v51;
v67 = (t << 1) | (t >>> 31);
t = (v67 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v65 ^ v60 ^ v54 ^ v52;
v68 = (t << 1) | (t >>> 31);
t = (v68 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v66 ^ v61 ^ v55 ^ v53;
v69 = (t << 1) | (t >>> 31);
t = (v69 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v67 ^ v62 ^ v56 ^ v54;
v70 = (t << 1) | (t >>> 31);
t = (v70 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v68 ^ v63 ^ v57 ^ v55;
v71 = (t << 1) | (t >>> 31);
t = (v71 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v69 ^ v64 ^ v58 ^ v56;
v72 = (t << 1) | (t >>> 31);
t = (v72 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v70 ^ v65 ^ v59 ^ v57;
v73 = (t << 1) | (t >>> 31);
t = (v73 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v71 ^ v66 ^ v60 ^ v58;
v74 = (t << 1) | (t >>> 31);
t = (v74 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v72 ^ v67 ^ v61 ^ v59;
v75 = (t << 1) | (t >>> 31);
t = (v75 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v73 ^ v68 ^ v62 ^ v60;
v76 = (t << 1) | (t >>> 31);
t = (v76 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v74 ^ v69 ^ v63 ^ v61;
v77 = (t << 1) | (t >>> 31);
t = (v77 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v75 ^ v70 ^ v64 ^ v62;
v78 = (t << 1) | (t >>> 31);
t = (v78 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
t = v76 ^ v71 ^ v65 ^ v63;
v79 = (t << 1) | (t >>> 31);
t = (v79 + ((a << 5) | (a >>> 27)) + e + (b ^ c ^ d) - 0x359d3e2a )|0;
e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
ctx[0] = ctx[0] + a | 0;
ctx[1] = ctx[1] + b | 0;
ctx[2] = ctx[2] + c | 0;
ctx[3] = ctx[3] + d | 0;
ctx[4] = ctx[4] + e | 0;
        this.len	+= 64;
      }
    init()
      {
        this.buf	= new Uint32Array([ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ]);
        this.fill	= 0;	// fill state of this.in
        this.len	= 0;	// total bytes transformed into hash so far
        return this;
      }
    end()
      {
        let pos		= this.fill;
        const len	= (this.len + pos)*8;	// bytes
        const in8	= this.in8;
        const in32	= this.in32;
        // there is at least 1 byte free in this.in8
        in8[pos]	= 0x80;
        let rest	= 64-1-pos;
        // The last 8 byte of the block will be overwritten below
        for (let i=rest; --i>=0; in8[++pos]=0);
        if (this.swap) this.swap(this.in32);
        if (rest<8)
          {
            this.trafo();
            for (let i=14; --i>=0; in32[i]=0);
          }
        in32[14]	= len / 0x100000000 | 0;	// we cannot use integer math here
        in32[15]	= len >>>0;
        this.trafo();
        this.fill	= void 0;
        this.len	= void 0;
        // this.buf contains the result
        if (this.swap) this.swap(this.buf);
        return this;
      }
//////////////////////
    update8(b)			// Uint8Array
      {
        const _	= this.in8;
        let out	= this.fill | 0;
        let len	= b.length | 0;	// we do not support more than 2^32 bytes (AKA 4GiB) per update
        let pos	= 0;
        while (len)
          {
            let max	= 64-out | 0;
            if (max > len)
              max	= len | 0;
            // To avoid the swap() on Big endian machines, following copy
            // should rather be replaced by some inlined Duff's device.
            // (for this we need to add up/down-counting repeats to ./unroll.sh)
            // (and we probably need conditional macros as well as recursive ones)
            _.set(b.subarray(pos, pos+max), out);
            pos	= pos + max | 0;
            out	= out + max | 0;
            len	= len - max | 0;
            if (out<64)
              break;
            if (this.swap) this.swap(this.in32);
            this.trafo();
            out	= 0;
          }
        this.fill	= out;
        return this;
      }
    update_str(s)		// this is not meant for long strings!
      {
        return this.update8(this.enc.encode(s));
      }
    get $bin()
      {
        return new Uint8Array(this.buf.buffer);
      }
    get $hex()
      {
        return Array.from(this.$bin, b => b.toString(16).padStart(2, '0')).join('');
      }
    static sha1(s,bin)
      {
        const out = sha1.init().update_str(s).end();
        return bin ? out.$bin : out.$hex;
      }
    static test(d,t)
      {
        const r = this.sha1(t);
        if (r !== d)
          throw `sha1c.js test failed for '${t}':\n'${d}' expected\n'${r}' got`;
//        D('test ok', r);
      }
    };
  const sha1 = new SHA1();	// for the static sha256 above
  SHA1.test('da39a3ee5e6b4b0d3255bfef95601890afd80709', '');									// 0 bytes
  SHA1.test('accfa188bccab15065e9feaf805d00217e958ec0', '0123456789abcdef0123456789abcdef0123456789abcdef0123456');		// single round
  SHA1.test('edc9055eaab6e86d803e41dd99272b3da1468595', '0123456789abcdef0123456789abcdef0123456789abcdef01234567');		// double round
  SHA1.test('ce4303f6b22257d9c9cf314ef1dee4707c6e1c13', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');	// 64 byte input
//  console.log('selftest ok');
  return SHA1;
});
