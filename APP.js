'use strict'; // Example for loadmain.js

export class Main
  {
  constructor(_)
    {
      this.div = _;
    }
  async main(modules)
    {
      this.lib = await modules.lib;
      this.lib.hello_world(this.div);
      throw 'this is a test error';
    }
  }

