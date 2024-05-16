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

export class DLP extends Emit
  {
  #drop;
  #load;
  #paste;

  constructor(dlp)
    {
      super('over enter leave drop load paste noitems nofiles item file unknown string');
      dlp ??= {};
      this.set_drop(dlp.drop ?? window);
      this.set_load(dlp.load);
      this.set_paste(dlp.paste ?? document.body);
    }

  set_drop(e)
    {
      if (!e) return;
      if (e instanceof _E0)
        e	= e.$;
      this.#drop = e;
      ['dragover','dragenter','dragleave','drop'].forEach(_ =>
        {
          const fn = this[_].bind(this);
          e.addEventListener(_, _ =>
            {
              _.stopPropagation();
              _.preventDefault();
              _.stopImmediatePropagation();
              fn(_);
              return false;
            }, {capture:true});
        });
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
  load(_)
    {
      this._Emit('load', _);
      this.files(_.target.files);
      return this;
    }
  paste(_)
    {
      this._Emit('paste', _);
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
        this._Emit('noitems');
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
        this._Emit('nofiles');
      return this;
    }

  item(_)
    {
      this._Emit('item', _);
      switch (_.kind)
        {
        case 'string':	_.getAsString((..._) => this.string(_)); break;
        case 'file':	this.file(_.getAsFile()); break;
        default:	this.unknown(_.kind, _.type); break;
        }
      return this;
    }
  unknown(kind, type)
    {
      this._Emit('unknown', {kind,type});
    }
  string(_)
    {
      this._Emit('string', _);
    }
  file(_)
    {
      this._Emit('file', _);
    }
  };

