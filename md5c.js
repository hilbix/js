// DO NOT EDIT. Automatically generated by ./unroll.sh md5c.js.in
// src 224fcf47777bedeefe91c3ccc67511962f30d37201dcb0118c753335d25958ec md5c.js.in
'use strict';
// This is free as in free beer, free speech and free baby.
// IMPORTANT!  NEVER COVER THIS CODE WITH A COPYRIGHT
// as this would break German Urheberrecht!
// If you need to state a Copyright, excempt this code from it!
//
// How to use?
//	<script src="md5.js"></script>
// then
//	const md5 = MD5.md5('string');
// or
//	const md5 = new MD5();
//	const a = md5.init().update_str('str1').update_str('str2').end().$hex;
//	const b = md5.init().update8(new UInt8Array(something))   .end().$bin;
// This can be repeated:    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const MD5 = (_=>_())(() => {
  function D(...a)
    {
      const p = [];
      for (const x of a)
        {
           if ('string' === typeof x)
             p.push(x);
           else if (typeof x !== 'object')
             p.push(`${Number(x|0).toString(16)}`.padStart(10,' '));
           else if (x.BYTES_PER_ELEMENT)
             p.push(Array.from(x).map(_ => _.toString(16).padStart(x.BYTES_PER_ELEMENT*2, '0')).join('_'));
        }
      console.log(p.join('  '));
    }
  class MD5
    {
    big_endian()
      {
        const b	= new ArrayBuffer(4);
        new Uint32Array(b)[0]	= 0x12345678;
        return new Uint8Array(b)[0] === 0x12;
      }
    constructor()
      {
        // input array
        const b		= new ArrayBuffer(64);		// must be a multiple of 32 bit
        this.in8	= new Uint8Array(b);
        // https://hacks.mozilla.org/2017/01/typedarray-or-dataview-understanding-byte-order/
        this.in32	= new Uint32Array(b);
        // encoder
        this.enc	= new TextEncoder();
        this.trafo	= this._trafo;
        if (this.big_endian())
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
    _trafo()
      {
        const ctx	= this.buf;
        const buf	= this.in32;
//        D(buf, ctx);
let a = ctx[0];
let b = ctx[1];
let c = ctx[2];
let d = ctx[3];
a += ( ( (b & c) | (~b & d) ) + buf[0] + 0xd76aa478 )|0;
a  = ( ( (a << 7) | ((a|0) >>> 25) ) + b )|0;
d += ( ( (a & b) | (~a & c) ) + buf[1] + 0xe8c7b756 )|0;
d  = ( ( (d << 12) | ((d|0) >>> 20) ) + a )|0;
c += ( ( (d & a) | (~d & b) ) + buf[2] + 0x242070db )|0;
c  = ( ( (c << 17) | ((c|0) >>> 15) ) + d )|0;
b += ( ( (c & d) | (~c & a) ) + buf[3] + 0xc1bdceee )|0;
b  = ( ( (b << 22) | ((b|0) >>> 10) ) + c )|0;
a += ( ( (b & c) | (~b & d) ) + buf[4] + 0xf57c0faf )|0;
a  = ( ( (a << 7) | ((a|0) >>> 25) ) + b )|0;
d += ( ( (a & b) | (~a & c) ) + buf[5] + 0x4787c62a )|0;
d  = ( ( (d << 12) | ((d|0) >>> 20) ) + a )|0;
c += ( ( (d & a) | (~d & b) ) + buf[6] + 0xa8304613 )|0;
c  = ( ( (c << 17) | ((c|0) >>> 15) ) + d )|0;
b += ( ( (c & d) | (~c & a) ) + buf[7] + 0xfd469501 )|0;
b  = ( ( (b << 22) | ((b|0) >>> 10) ) + c )|0;
a += ( ( (b & c) | (~b & d) ) + buf[8] + 0x698098d8 )|0;
a  = ( ( (a << 7) | ((a|0) >>> 25) ) + b )|0;
d += ( ( (a & b) | (~a & c) ) + buf[9] + 0x8b44f7af )|0;
d  = ( ( (d << 12) | ((d|0) >>> 20) ) + a )|0;
c += ( ( (d & a) | (~d & b) ) + buf[10] + 0xffff5bb1 )|0;
c  = ( ( (c << 17) | ((c|0) >>> 15) ) + d )|0;
b += ( ( (c & d) | (~c & a) ) + buf[11] + 0x895cd7be )|0;
b  = ( ( (b << 22) | ((b|0) >>> 10) ) + c )|0;
a += ( ( (b & c) | (~b & d) ) + buf[12] + 0x6b901122 )|0;
a  = ( ( (a << 7) | ((a|0) >>> 25) ) + b )|0;
d += ( ( (a & b) | (~a & c) ) + buf[13] + 0xfd987193 )|0;
d  = ( ( (d << 12) | ((d|0) >>> 20) ) + a )|0;
c += ( ( (d & a) | (~d & b) ) + buf[14] + 0xa679438e )|0;
c  = ( ( (c << 17) | ((c|0) >>> 15) ) + d )|0;
b += ( ( (c & d) | (~c & a) ) + buf[15] + 0x49b40821 )|0;
b  = ( ( (b << 22) | ((b|0) >>> 10) ) + c )|0;
a += ( ( (b & d) | (c & ~d) ) + buf[1] + 0xf61e2562 )|0;
a  = ( ( (a << 5) | ((a|0) >>> 27) ) + b )|0;
d += ( ( (a & c) | (b & ~c) ) + buf[6] + 0xc040b340 )|0;
d  = ( ( (d << 9) | ((d|0) >>> 23) ) + a )|0;
c += ( ( (d & b) | (a & ~b) ) + buf[11] + 0x265e5a51 )|0;
c  = ( ( (c << 14) | ((c|0) >>> 18) ) + d )|0;
b += ( ( (c & a) | (d & ~a) ) + buf[0] + 0xe9b6c7aa )|0;
b  = ( ( (b << 20) | ((b|0) >>> 12) ) + c )|0;
a += ( ( (b & d) | (c & ~d) ) + buf[5] + 0xd62f105d )|0;
a  = ( ( (a << 5) | ((a|0) >>> 27) ) + b )|0;
d += ( ( (a & c) | (b & ~c) ) + buf[10] + 0x02441453 )|0;
d  = ( ( (d << 9) | ((d|0) >>> 23) ) + a )|0;
c += ( ( (d & b) | (a & ~b) ) + buf[15] + 0xd8a1e681 )|0;
c  = ( ( (c << 14) | ((c|0) >>> 18) ) + d )|0;
b += ( ( (c & a) | (d & ~a) ) + buf[4] + 0xe7d3fbc8 )|0;
b  = ( ( (b << 20) | ((b|0) >>> 12) ) + c )|0;
a += ( ( (b & d) | (c & ~d) ) + buf[9] + 0x21e1cde6 )|0;
a  = ( ( (a << 5) | ((a|0) >>> 27) ) + b )|0;
d += ( ( (a & c) | (b & ~c) ) + buf[14] + 0xc33707d6 )|0;
d  = ( ( (d << 9) | ((d|0) >>> 23) ) + a )|0;
c += ( ( (d & b) | (a & ~b) ) + buf[3] + 0xf4d50d87 )|0;
c  = ( ( (c << 14) | ((c|0) >>> 18) ) + d )|0;
b += ( ( (c & a) | (d & ~a) ) + buf[8] + 0x455a14ed )|0;
b  = ( ( (b << 20) | ((b|0) >>> 12) ) + c )|0;
a += ( ( (b & d) | (c & ~d) ) + buf[13] + 0xa9e3e905 )|0;
a  = ( ( (a << 5) | ((a|0) >>> 27) ) + b )|0;
d += ( ( (a & c) | (b & ~c) ) + buf[2] + 0xfcefa3f8 )|0;
d  = ( ( (d << 9) | ((d|0) >>> 23) ) + a )|0;
c += ( ( (d & b) | (a & ~b) ) + buf[7] + 0x676f02d9 )|0;
c  = ( ( (c << 14) | ((c|0) >>> 18) ) + d )|0;
b += ( ( (c & a) | (d & ~a) ) + buf[12] + 0x8d2a4c8a )|0;
b  = ( ( (b << 20) | ((b|0) >>> 12) ) + c )|0;
a += (   (b ^ c ^ d)           + buf[5] + 0xfffa3942 )|0;
a  = ( ( (a << 4) | ((a|0) >>> 28) ) + b )|0;
d += (   (a ^ b ^ c)           + buf[8] + 0x8771f681 )|0;
d  = ( ( (d << 11) | ((d|0) >>> 21) ) + a )|0;
c += (   (d ^ a ^ b)           + buf[11] + 0x6d9d6122 )|0;
c  = ( ( (c << 16) | ((c|0) >>> 16) ) + d )|0;
b += (   (c ^ d ^ a)           + buf[14] + 0xfde5380c )|0;
b  = ( ( (b << 23) | ((b|0) >>> 9) ) + c )|0;
a += (   (b ^ c ^ d)           + buf[1] + 0xa4beea44 )|0;
a  = ( ( (a << 4) | ((a|0) >>> 28) ) + b )|0;
d += (   (a ^ b ^ c)           + buf[4] + 0x4bdecfa9 )|0;
d  = ( ( (d << 11) | ((d|0) >>> 21) ) + a )|0;
c += (   (d ^ a ^ b)           + buf[7] + 0xf6bb4b60 )|0;
c  = ( ( (c << 16) | ((c|0) >>> 16) ) + d )|0;
b += (   (c ^ d ^ a)           + buf[10] + 0xbebfbc70 )|0;
b  = ( ( (b << 23) | ((b|0) >>> 9) ) + c )|0;
a += (   (b ^ c ^ d)           + buf[13] + 0x289b7ec6 )|0;
a  = ( ( (a << 4) | ((a|0) >>> 28) ) + b )|0;
d += (   (a ^ b ^ c)           + buf[0] + 0xeaa127fa )|0;
d  = ( ( (d << 11) | ((d|0) >>> 21) ) + a )|0;
c += (   (d ^ a ^ b)           + buf[3] + 0xd4ef3085 )|0;
c  = ( ( (c << 16) | ((c|0) >>> 16) ) + d )|0;
b += (   (c ^ d ^ a)           + buf[6] + 0x04881d05 )|0;
b  = ( ( (b << 23) | ((b|0) >>> 9) ) + c )|0;
a += (   (b ^ c ^ d)           + buf[9] + 0xd9d4d039 )|0;
a  = ( ( (a << 4) | ((a|0) >>> 28) ) + b )|0;
d += (   (a ^ b ^ c)           + buf[12] + 0xe6db99e5 )|0;
d  = ( ( (d << 11) | ((d|0) >>> 21) ) + a )|0;
c += (   (d ^ a ^ b)           + buf[15] + 0x1fa27cf8 )|0;
c  = ( ( (c << 16) | ((c|0) >>> 16) ) + d )|0;
b += (   (c ^ d ^ a)           + buf[2] + 0xc4ac5665 )|0;
b  = ( ( (b << 23) | ((b|0) >>> 9) ) + c )|0;
a += (   (c ^ (b | (~d)))      + buf[0] + 0xf4292244 )|0;
a  = ( ( (a << 6) | ((a|0) >>> 26) ) + b )|0;
d += (   (b ^ (a | (~c)))      + buf[7] + 0x432aff97 )|0;
d  = ( ( (d << 10) | ((d|0) >>> 22) ) + a )|0;
c += (   (a ^ (d | (~b)))      + buf[14] + 0xab9423a7 )|0;
c  = ( ( (c << 15) | ((c|0) >>> 17) ) + d )|0;
b += (   (d ^ (c | (~a)))      + buf[5] + 0xfc93a039 )|0;
b  = ( ( (b << 21) | ((b|0) >>> 11) ) + c )|0;
a += (   (c ^ (b | (~d)))      + buf[12] + 0x655b59c3 )|0;
a  = ( ( (a << 6) | ((a|0) >>> 26) ) + b )|0;
d += (   (b ^ (a | (~c)))      + buf[3] + 0x8f0ccc92 )|0;
d  = ( ( (d << 10) | ((d|0) >>> 22) ) + a )|0;
c += (   (a ^ (d | (~b)))      + buf[10] + 0xffeff47d )|0;
c  = ( ( (c << 15) | ((c|0) >>> 17) ) + d )|0;
b += (   (d ^ (c | (~a)))      + buf[1] + 0x85845dd1 )|0;
b  = ( ( (b << 21) | ((b|0) >>> 11) ) + c )|0;
a += (   (c ^ (b | (~d)))      + buf[8] + 0x6fa87e4f )|0;
a  = ( ( (a << 6) | ((a|0) >>> 26) ) + b )|0;
d += (   (b ^ (a | (~c)))      + buf[15] + 0xfe2ce6e0 )|0;
d  = ( ( (d << 10) | ((d|0) >>> 22) ) + a )|0;
c += (   (a ^ (d | (~b)))      + buf[6] + 0xa3014314 )|0;
c  = ( ( (c << 15) | ((c|0) >>> 17) ) + d )|0;
b += (   (d ^ (c | (~a)))      + buf[13] + 0x4e0811a1 )|0;
b  = ( ( (b << 21) | ((b|0) >>> 11) ) + c )|0;
a += (   (c ^ (b | (~d)))      + buf[4] + 0xf7537e82 )|0;
a  = ( ( (a << 6) | ((a|0) >>> 26) ) + b )|0;
d += (   (b ^ (a | (~c)))      + buf[11] + 0xbd3af235 )|0;
d  = ( ( (d << 10) | ((d|0) >>> 22) ) + a )|0;
c += (   (a ^ (d | (~b)))      + buf[2] + 0x2ad7d2bb )|0;
c  = ( ( (c << 15) | ((c|0) >>> 17) ) + d )|0;
b += (   (d ^ (c | (~a)))      + buf[9] + 0xeb86d391 )|0;
b  = ( ( (b << 21) | ((b|0) >>> 11) ) + c )|0;
ctx[0] = a + ctx[0] | 0;
ctx[1] = b + ctx[1] | 0;
ctx[2] = c + ctx[2] | 0;
ctx[3] = d + ctx[3] | 0;
        this.len	+= 64;
      }
    init()
      {
        this.buf	= new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]);
        this.fill	= 0;	// fill state of this.in
        this.len	= 0;	// total bytes transformed into hash so far
        return this;
      }
    end()
      {
        let pos		= this.fill;
        const len	= (this.len + pos) * 8;	// we count bits
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
        in32[15]	= len / 0x100000000 | 0;	// we cannot use integer math here
        in32[14]	= len | 0;
        this.trafo();
        this.fill	= void 0;
        this.len	= void 0;
        // this.buf contains the result
        if (this.swap) this.swap(this.buf);
        return this;
      }
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
        return new Uint8Array(this.buf);
      }
    get $hex()
      {
        return Buffer.from(this.buf.buffer).toString('hex');
      }
    static md5(s,bin)
      {
        const out = md5.init().update_str(s).end();
        return bin ? out.$bin : out.$hex;
      }
    static test(d,t)
      {
        const r = this.md5(t);
        if (r !== d)
          throw `md5c.js test failed for '${t}':\n'${d}' expected\n'${r}' got`;
//        D('test ok', r);
      }
    };
  const md5 = new MD5();	// for the static md5 above
  MD5.test('d8ea71eb4d2af27f59a5316c971065e6', '0123456789abcdef0123456789abcdef0123456789abcdef0123456');		// single round
  MD5.test('a68f061e81239660f6305195739ba7f0', '0123456789abcdef0123456789abcdef0123456789abcdef01234567');		// double round
  MD5.test('fe3a1ff59f3b89b2ad3d33f08984874b', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');	// 64 byte input
//  console.log('selftest ok');
  return MD5;
});
