// Drop Load Paste
//
// Asynchronously load data into JavaScript.

'use strict';

// const dlp = new DLP({drop,load,paste});
//
// Either get a feed:
//	for async (const data of dlp.data())
//	  {
//	    // got data
//	  }
// or via event callback:
//	dlp.ON('data', data => { // process data
// or TBD.

function dump(w,o)
{
  const dump = (x,_) => _ && Reflect.ownKeys(_).forEach(_ => console.log('DUMP', w, x, _, o[_]));
  dump('p', Reflect.getPrototypeOf(o));
  dump('o', o);
}

// Workaround for what I consider being a browser bug plus a very bad design of ES13 (things not being visible)
function fix(o)
{
  const r = {};
  const set = (k,v) => r[k]=v;
  const add = _ => { const v=o[_]; v===void 0 || set(_,v) };
  const key = _ => _ && Reflect.ownKeys(_).forEach(add);

//  'kind type'.split(' ').forEach(add);
  key(Reflect.getPrototypeOf(o));
  key(o);
  return r;
}

export class DLP extends Emit
  {
  #drop;
  #load;
  #paste;

  constructor(dlp)
    {
      super('over enter leave drop load paste input noitems nofiles item file unknown string');
      dlp ??= {};
      this.set_drop(dlp.drop ?? window);
      this.set_load(dlp.load);
      this.set_paste(dlp.paste ?? dlp.drop ?? window);
    }

  set_drop(e)
    {
      if (!e) return;
      e = E(e);
      this.#drop = e = E(e);
      // there must be a better way .. somehow .. in future
      ['dragover','dragenter','dragleave','drop'].forEach(_ => e.ON(_, this[_].bind(this)));
      return this;
    }
  set_load(e)
    {
      if (!e) return;
      this.#load = e	= E(e);
      e.ON('change',	this.load.bind(this));
      return this;
    }
  set_paste(e)
    {
      if (!e) return;
      this.#paste = e	= E(e);
      e.ON('paste',	this.paste.bind(this));
      return this;
    }


  dragover(_)
    {
      this._Emit('over', _);
      return this;
    }
  dragenter(_)
    {
      this._Emit('enter', _);
      return this;

      if (this.tmp && _ === this.tmp) return;
      if (this.tmp) this.leave();
      const d = this.tmp = this.ev(E.TEXTAREA.style({position:'absolute',display:'block',opacity:0.5,background:'#888',zIndex:9999,border:'1px solid red',top:0,bottom:0,left:0,right:0}).attr({placeholder:'DROP HERE'}));
      this.e.prep(d);
//      console.log('E', _ === this.tmp, _?.$, this.tmp?.$);
//      const r = this.e.$.getBoundingClientRect()
//      d.$x	= r.x;
//      d.$y	= r.y;
//      d.$w	= r.w;
//      d.$h	= r.h;
//      console.log('Dx', r, d.$xywh);

      return this;
    }
  dragleave(_)
    {
      this._Emit('leave', _);
      return this;

      let v;
      if (this.tmp)
        {
          if (_ && _ !== this.tmp) return;
          v = this.tmp.$value;
          console.log('T', {v});
          this.tmp.rm();
        }
      this.tmp = void 0;
      return v;

      return this;
    }

  // We must process this immediately, as all information vanishes as soon as the event callback returns.
  // So no async etc. here allowed.
  drop(_)
    {
      this._Emit('drop', _);
      this.items(_.dataTransfer);
      return this;
    }
  input(_)
    {
      _ = E(_);
      this._Emit('input', _);
      this.files(_.$);
      return this;
    }
  load(_)
    {
      this._Emit('load', _);
      this.files(_.target);
      return this;
    }
  // XXX TODO XXX Also an die Paste-Events muss ich nochmals ran.
  // Bei Chrome kann man (unter Linux) eine Datei pasten.  So wie ich das erwarte.  Ist aber ein DROP-Event, kein PASTE event.
  // Bei Firefox kommt aber (unter Linux) stattdessen der Dateiname als String.
  // Ist das ein Bug im FF oder schlichtweg Unkenntnis von mir wie man da an die "echt" Datei rankommen soll?
  // Liegt es vielleicht daran, dass ich den PASTE-Event beende (.stopPropagation()) und es käme sonst ein DROP-Event hinterher?
  // Wie auch immer, das braucht noch weitere (vermutlich glorios scheiternde) Tests usw. irgendwann in einer entfernten Zukunft
  paste(_)
    {
      this._Emit('paste', _);
//      dump('e', _);
//      dump('c', _.clipboardData);
      this.items(_.clipboardData);
      return this;
    }

  items(_)
    {
      let got;
      for (const i of _.items)
        {
          this.item(i);
          got = 1;
        }
      if (!got)
        this._Emit('noitems', fix(_));
      return this;
    }
  files(_)
    {
      let got;
      for (const i of _.files)
        {
          this.file(i);
          got = 1;
        }
      if (!got)
        this._Emit('nofiles', fix(_));
      return this;
    }

  item(_)
    {
      this._Emit('item', _);
      const org = fix(_);	// information no more available in Chrome after .getAsString() etc.  Is this a bug?!?
      switch (_.kind)
        {
        case 'string':	_.getAsString(s => this.string(s, org)); break;
        case 'file':	this.file(_.getAsFile(), org); break;
        default:	this.unknown(_.kind, org); break;
        }
      return this;
    }
  unknown(kind, _)
    {
      this._Emit('unknown', kind, _);
    }
  string(s, _)
    {
      this._Emit('string', s, _);
    }
  file(_)
    {
      this._Emit('file', _);
    }
  };

