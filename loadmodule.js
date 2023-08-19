// HTML driven module loader with URL fallback support
// (this currently is a bit chatty on console)
//
// This does not support dynamic loading of a module
// but allows fallback URLs in case the primary URL fails.
//
// As we cannot pass parameters to modules via document.currentScript,
// parameters have to be passed in as <meta> tags.
// As we cannot pass parameters to modules via document.currentScript,
// <meta name>s are hardcoded after the last path's component of the module's name.
// <meta content> carries the default url to load
// <meta data> carries fallback load locations
//
// Name the fallbacks data-0 to data-N, where N is the precedence (0 first fallback)
//
// - data-as is the name under which the module is registered in loadmodule
// - all events are dispatched on "document".  (This feature is untested)
//   - data-load is dispatched when a module starts loading (once per module)
//   - data-trace is dispatched before the import is tried
//   - data-ok is dispatched when a module has loaded successfully (once per module)
//   - data-fail is dispatched when a module loading fails (each failure)
//   - data-error is dispatched when a module failed to load (once per module)
//   - data-fin is dispatched when all modules are loaded
//
// Notes:
//
// - In future, possibly calculated fallback may be implemented (like calling some JS function)
// - Not all possible errors are detected by nature.
//
// Example which works for Octokit, as of 2023-06 the documented URL fails to load:
//
//	<meta name="loadmodule.js" data-as="octokit" content="https://cdn.skypack.dev/octokit" data-0="https://cdn.skypack.dev/octokit@v2.0.14"/>
//	<script type="module" src="loadmodule.js"></script>
//
// If you use it programmatically (via import()) it works nearly the same:
//
//	<meta name="loadmodule" data-as="OcTo" content="https://cdn.skypack.dev/octokit" data-0="https://cdn.skypack.dev/octokit@v2.0.14"/>
//
// with:
//
//	import modules from "./loadmodule";
//	const octokit = await modules.OcTo;
//
// or:
//
//	const { default:modules } = await import('loadmodule');
//	const octokit = await modules.OcTo;
//
// Additional information:
//
//	await modules.$MODULE.module	// the module.  Same as await modules.MODULE
//	await modules.$MODULE.base	// the main URL
//	await modules.$MODULE.url	// the URL the module was loaded.  .base is tried first
//	await modules.$MODULE.error	// the last error.  undefined if successful
//	await modules.$MODULE.name	// data-as, defaults to .base
//
// $MODULE can either be .name or .base
//
// For a demo see
//	https://github.com/hilbix/minion/blob/master/web/gh.html
//
// License:
//
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.
// Read: This code is free as free beer, free speech and free baby.
// In our Universe, from the data perspective, there is not much of a difference between live code and babies.
// Copyright on code extends to Copyright on babies.  Please stop abusing babies!
//
// Bugs:
//
// FALLBACK INCOMPATIBLE TO SRI (<link rel="modulepreload" integrity>):
//	Either fallback is loaded even if not needed, or it has no SRI.
//	I really do not get  how such a bad standard could be proposed.
//	Why not having a doc (plain text is enough) to include all possible SHAs.
//	This doc itself then must be protected by a signature or SHA
//	from the header of the HTML document.
//	With such a doc present, only documents matching the SHAs can be loaded
//	and executed, to pretect against evil <script> injection.
//	SRI and server headers are mutually excusive.  Servers cannot provide SRI.
// crossorigin="anonymous"
//	Spec is unclear how import() is done.  Perhaps <link> does it?
//	So this probably is another bug.
// dynamic loading
//	loadmodule.js only works on HTML level.  If you need dynamic loading on
//	import() level, you must re-implement the wheel using import() yourself.
// Content-Security-Policy: require-sri-for script
//	Such a feature is probably the most important feature in the entire history
//	of the Web, but this is no more on MDN and even no more mentioned at all.
//	There must be a way to switch to mandatory SRI, but not on a server level
//	but on a file:// level as well.  We need a way that browsers refuse
//	to execute things which are not authentic.
//
// I do not know of any way to fallback to some other URLs when loading of the primary URL fails.
// But I crucially need it.  Perhaps all above bugs can be solved in future
// by use of some signed meta-document and dynamic <link> injection:
//
// In future I'd like to reduce the initial HTML page of an APP to the bare minimum:
//
//	<script src="load.js" integrity="SHA1" data-sha="SHA2"></script>
//
// This then:
//
// - loads load.js
//   - load.js is authenticated by its checksum
// - loads SHA2.json which then specifies the rest
//   - SHA2.json is authenticated by its checksum SHA2
// - SHA2.json then includes all the rest of the definitions
//   - For example it can set a public key for signing
//   - And all .js resources then have a .sig resource with the signed SRI
//   - or similar
// - Loading then is done by injecting
//   - Either <script integrity>
//   - Or <link integrity>
// - It should work on https:// and http:// level as well on file:// level
//   - the latter is the key feature to locally serve all HTML apps
//   - As I wrote:  Servers cannot provide SRI, so you must load it locally
//   - There is no other way to do this except run some HTTP server locally
//
// But not today.

// I really have no idea what happens if import.meta isn't supported,
// as I did not find a way to test that.  Sorry.
// https://stackoverflow.com/a/76493355/490291
const me = import.meta.url?.split('/').pop() || 'loadmodule.js';
const metas = Array
  .from(document.getElementsByName(me))
  .filter(_ => _.nodeName === 'META')
  .map(_ => Array
    .from(_.attributes)
    .map(_ => ([_.name.split('-'), _.value]))
    .filter(([name,value]) => name.length===2 && name[0] ==='data')
    .reduce((a,[[x,id],v]) => ((`${id|0}`===id?(a[0][id|0+1]=v):(a[1][id]=v)), a), [[_.attributes.content.value],{}])
    );
//console.log(me, metas);

//const jsons = Array
//  .from(document.getElementsByName(me))
//  .filter(_ => _.nodeName === 'DIV')
//  .map(_ => JSON.parse(_.innerText));
//console.log(me, jsons);

function mkev(type, detail)
{
  if (!type) return;
  console.log(me, 'event', type, detail);
  document.dispatchEvent(new CustomEvent(type, {detail}));
}

const mods = {};

const get = _ => new Proxy(mods,
  { get(t,p,r)
    {
      if (!(p in t)) throw new Error(`module ${JSON.stringify(p)} not found in loaded modules.  Known values: ${Object.keys(mods).join(' ')}`);
      return t[p].then(d => d[_]);
    }
  });

export const module	= get('module');
export const url	= get('url');
export const base	= get('base');
export const name	= get('name');
export const error	= get('error');

function load(m)
{
  console.log(me, 'loading', m);

  const fin	= m[1]['fin'];
  if (fin)
    (fins[fin] || (fins[fin] = [])).push(base);

  const base	= m[0][0];
  const name	= m[1]['as'] || (base.endsWith('.js') ? base.substring(0,base.length-3) : base);
  const detail	= {base,name};
  const trig	= type => mkev(m[1][type], detail);

  const run = async () =>
    {
      trig('load');

      for (const url of m[0])
        try {
          detail.url	= url;
          trig('trace');

          const module = await import(url.split('/',2).length<2 ? `./${url}` : url);
          if (url !== base)
            console.log(me, 'loaded', url, 'instead of', base);

          delete detail.error;
          detail.module	= module;
          trig('ok');
          return detail;

        } catch(_) {

          console.error(me, 'loading', url, 'failed:', _);
          detail.error	= _;
          trig('fail');

        }
      trig('error');
      return detail;
    }
  return mods[base] = mods[name] = run();
}

if (!metas.length)
  console.log(me, 'nothing to load');

const fins = {};
const list = metas.map(load);
//list.push(Promise.reject('test'));	// we only report a single (the last) internal error, AFAICS this is enough
export const all = Promise.allSettled(list)
//.then(_ => (console.log(me, 'finish', _),_))
.then(_ => Object.fromEntries(_.map(_ => _.value && [_.value.name,_.value.module || _.value.error] || [Symbol(_.status),_.reason])))
.finally(() => Object.values(fins).forEach(mkev))
.then(_ => (console.log(me, 'finish', _),_))

// We want to use following idiom:
//
// <meta name="loadmodule" as="module1" content="module1.js"/>
//
// import modules from './loadmodule';
// const module1 = await modules.module1;
//
// Also we want to be able to access .url .base .name and so on with
//
// const module1url = await modules.module1.url;
//
// Hence
//	await modules.module1.module
// is the same as
//	await modules.module1
// and
//	await (await (await modules).module1).url !== await modules.module1.url
// Keep that in mind.
export default new Proxy(mods,
  { get(t,p,r)
    {
      if (!(p in t)) throw new Error(`module ${JSON.stringify(p)} not found in loaded modules.  Known values: ${Object.keys(mods).join(' ')}`);
      return new Proxy(t[p],
        { get(t,p,r)
          {
            // t.then(fn) gets passed a function, which must be called, when the promise resolves.
            // Else return the value, which can be awaited
            return p === 'then' ? fn => t.then(_ => fn(_.module)) : t.then(_ => _[p]);
          }
        });
    }
  });

