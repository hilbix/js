'use strict';

class AsyncWebSocket
  {
  debug(what, _)
    {
      console.log(`WS ${what}`, this.url, _);
      return this;
    }
  constructor(url)
    {
      this.url	= url;
      this.q	= [];
      this.cnt	= 0;
      this.cbs	= [new Set(), new Set()];
    }
  add(cb, info)
    {
      if (!info) info = 1;
      for (let i=0; info && i<this.cbs.length; i++, info>>=1)
        if (info&1)
          this.cbs[i].add(cb);
      return this;
    }
  rm(cb, info)
    {
      if (!info) info = 1;
      for (let i=0; info && this.cbs[i]; i++, info>>=1)
        if (info&1)
          this.cbs[i].delete(cb);
      return this;
    }
  cb(s, i)
    {
      const l = this.cbs[i];
      for (const cb of l.keys())
        {
          try { if (!cb(s, this)) continue } catch (e) {}
          l.delete(cb);
        }
      return this;
    }
  set state(s)
    {
      this._state = s;
      this.cb(s, 0);
    }
  set info(s)
    {
      this._info = s;
      this.cb(s, 1);
    }
  put(s)
    {
      this.q.push(s);
      return this.signal();
    }
  signal()
    {
      if (this._p)
        {
          this._p = void 0;
          this._w();
        }
      return this;
    }
  get P()
    {
      return this.Open().then(() => this._p || (this._p = new Promise(_ => this._w=_)));
    }

  send(..._)	{ this.Send(..._); return this }
  async Send(_, type)
    {
      if (isString(_)) _ = new Blob([_], {type:type||'text/plain'});	// BLOB WTF WHY?
      await this.Open();
      this.ws.send(_);
//      this.debug('out', _);
      return _;
    }
  async Get()
    {
      while (!this.q.length)
        await this.P;
      return this.q.shift();
    }
  async *[Symbol.asyncIterator]()
    {
      for (;;)
        yield await this.Get();
    }
  Open()
    {
      if (this.ws) return this._open;

      let err, open, close;

      this._open	= new Promise((..._) => open=_);
      this._close	= new Promise((..._) => close=_).catch(DONOTHING);

      this.state	= 'opening';
      const ws = this.ws	= new WebSocket(this.url);
      ws.addEventListener('open', _ =>
        {
          this.state = 'open';
          err = 'closed';
          const o = open;
          open = void 0;
          o[0](_);
        });
      ws.addEventListener('message', _ =>
        {
//          this.debug('msg', _);
          this.info = `msg ${++this.cnt}`;
          this.put(_.data.text());
        });
      ws.addEventListener('close', _ =>
        {
          this.debug('close', _);

          if (this.ws === ws)
            this.ws	= void 0;

          const o = open;
          open = void 0;
          if (o) o[1](_);

          const n = this._state === 'err' ? 1 : 0;

          this.state = 'close';
          this.info  = `${err}: ${_.wasClean} ${_.code} ${_.reason}`;

          close[n](_);
          close = void 0;
        });
      ws.addEventListener('error', _ =>
        {
          this.debug('err', _);
          this.state = 'err';
          err = 'error';	// errors are not explained at all?
        });
    }
  Close()
    {
      const ws	= this.ws;
      this.ws	= void 0;
      if (ws)
        {
          this.state	= 'closing';
          ws.close();
        }
      return this._close;
    }
  };

