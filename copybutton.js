'use strict';

const copyTextFromClip	= _ => PR.then(() => navigator.clipboard.readText())           .catch(_ => { console.log('clip read err' , _); throw _ });
const copyTextToClip	= _ => PR.then(() => navigator.clipboard.writeText(_)).then(_ => '✓', _ => { console.log('clip write err', _); return '✗' });
const copyButton = (e, t) =>
{
  // ✂  🗐  ⎘  📋  ⧉   ...
  // ✓  ✗  ☒  ☑   ☐   ...
  const me = e.BUTTON;
  me.text('⧉').attr({width:'2em'}).on('click', () => copyTextToClip(t).then(_ => me.$text = _));
  return e;
}

