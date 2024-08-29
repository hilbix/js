'use strict';	// addon to es13.js

// UrlState is a completely wrong hacky thing and should go away!
//
// For now this here only is a step forward to separate the implementation from the use.
// On each DOM element, define
//	data-urlstate="id"
// or
//	data-urlstate
// which takes the element's id (fallback to name).
// On <input radio> you only need a single element.
//
// After that call
//	UrlState.auto()
//
// DOM is not observed or live list, so elements showing up later are ignored.
// For those you must run
//	state=UrlState.ADD(E(element))
// yourself.
//
// BLOBs like <textarea> are NOT supported with data-urlstate yet.
//
// Following elements are supported:
//
// <select>		-> take checked <option> (id || option.$value || option.$text)
// <input text>		-> the text
// <input radio>	-> the checked one
// <input check>	-> the check state

// The (future, not yet implemented) correct method is something like:
//
// - Define a special VALUE object which keeps a (possibly complex) value.
//   - Best it is implemented as a Proxy with dictionary syntax.
// - There is a (weak!) list of listeners, which are informed if the value changes.
//   - For this we need an iterable WeakMap
// - If deeper information is updated in the structure, the value object must be notified.
//   - For efficiency reason there is no deep observer in the structure
//
// For this we need to implement Cancellable Promises:
// - A VALUE can be set to a Promise which then is asynchronously awaited.
// - If several Promises are stored, they execute in parallel.
// - There is an AbortController, such that newer Promises can abort older ones.
// - The AbortController can be invoked manually, too.
//
// The VALUE has a number of hierarchical histories:
// - There is a (weak!) list of listeners, which are informed if the history changes.
// - History 0 is for unsaved changes
// - History 1 is for saved changes
// - History 2 is for archived saves
// - and so on
// - Each history has a maximum length
//   - By default a history has length 1
// - .save() or .save(0) saves history 0 into history 1
// - .save(1) saves history 1 into history 2 and then history 0 into history 1
// - and so on.
// - To allow .save(N) to be O(1) we need sparse Array support with O(1) insertion/deletion.
// - Histories are automatically created and maintained (when the upper one is saved)
//
// There is .load() and .save() of a VALUE
// - .load(0) is automatically invoked when the object is created
//   - for this the object creation must be asynchronous
//   - afterwards the values can be synchronously read and written
//   - But the Listeners/.save() etc. are fully asynchronous in background
// - These are asynchronous handler functions, but there is only a single one for each history level
//   - If there is no handler or the handler throws, the handler of the next lower history is invoked
//   - There are fallback handlers of level -1.  Use these to catch the error!
// - The handlers trigger on a single history level only
//   - As the history is a range to the history array, the handlers have full access to everything!
// - .load() is automatically invoked when the history is accessed the first time
//
// Note that there is only one type of Listeners.
// - Listeners are always fully asynchronous
//   - If a Listener throws it is removed
// - Listeners subscribe to some event on some history level.
//   - Level 0 listeners see all value changes
//   - Level 1 only see value changes on history 1
//   - and so on
//   - There are also other events an which a listener can trigger
// - Listeners only run once, so a Listener is NOT invoked again if the same event hits while it runs
//   - Instead the AbortController of a Listener is notified
// - If a listener finishes and the event happened again while it ran, it is invoked again
// - Listener invocation can be delayed, then a listener triggers a few ms later than immediately
//
// There are also synchronous callbacks:
// - These callbacks can inspect the value, alter it or even revoke the change
//   - Revocation is done by throwing
//   - Accept means return undefined (=== void 0)
//   - Changing is done by returning something different
//
// On top of that we then can implement VALUE-binding:
// - The VALUE then can be bound to a DOM element
//   - it reacts on changes to this element
//   - and updates the element automatically
// - The binding can be on a certain history level
//   - There is a special form of binding, which manages child nodes with the history contents
// - There can be more than one binding on any level
//   - All implemented thanks to Listeners
//   - If the DOM element goes away the Listener should vanish, too
//   - Note that there exist no weak maps to DOM elements!
//   - But there exist live NodeLists, so we have to utilize that.
//
// And on top of that we than can re-implement automatic UrlState.
// - We can then store big things like <textarea> into sessionstore/localstore/database as well

Object.entries((()=>{

function getset(_)
{
  const dummy = {get:()=>{}, set:()=>{}};

  switch (_.nodeName)
    {
    default: console.error('UrlState: unknown how to handle', _.nodeName, _); return dummy;
    case 'INPUT':
      switch (_.type)
        {
        case 'hidden':
          console.warn('UrlState: ignoring INPUT type', _.type, _);
          return dummy;

        case 'radio':		return { get:()=>_.value,	set:v=>{ if (_.value === v) _.checked = true } };
        case 'checkbox':	return { get:()=>_.checked,	set:v=>_.checked=v };

        default:
          console.warn('UrlState: treating like text: INPUT type', _.type, _);
        case 'color':
        case 'number':
        case 'text':
          break;
        }
    case 'SELECT':
      break;
    }
  return { get:() => _.value, set:v => console.log('SET', _.type, _.value=v) };
}

const known = new Set();

return (
  { ADD(e,id)
    {
      e = E(e);		// That's wrong.  It should be a live list of elements in the DOM.  I need another idiom for this.
      if (!id)
        id	= e.$.id || e.$.name;
      if (!id)
        {
          console.error('UrlState: ignoring', e.$, '(has no id nor name)');
          return;	/* return nothing!	*/
        }
      const st = UrlState(id);

//      console.log('UrlState.ADD',id,e.$all,st);
      if (!known.has(e))
        e.ON('change _value', _ => { st.state = getset(_.target).get() });
      known.add(e);
      return st;
    }

// add or update some elements on the list
  , update(...a) { this.Update(...a); return this }
  , Update(_,pfx,ds)
    {
      pfx = pfx ? `${pfx}-` : '';	// falsey pfx gives empty string, sorry
      for (const e of E(_))
        {
          const v = (ds && e.dataset[ds]) || e.id || e.name;

          if (!v)
            {
              console.error('UrlState: ignoring', e, '(has no id nor name)');
              continue;
            }

          // For those where the chosen ID === .name select all the elements
          // (needed for <input radio>)
          const _ = v === e.name ? E.NAME(v) : E(e);

          const st = this.ADD(_, `${pfx}${v}`).state;
          if (st !== void 0)
            for (const x of _)
              getset(x).set(st);
        }
      return _;
    }

// UrlState.auto(optionaldatasetname, optionalprefix)
// optionaldatasetname defaults to
//	urlstate
// giving data-urlstate for this here.
// optionalprefix defaults to
//	optionaldatasetname
// giving a prefix of optionaldatasetname- or nothing if optionaldatasetname is not set
  , auto(name, prefix)
    {
//      console.log('UrlState.auto', name, prefix);
      const ds	= name || 'urlstate';
      return this.Update(E.ALL(`[data-${ds}]`), prefix||name, ds);
    }
  });

})()).forEach(([k,v]) => UrlState[k] || (UrlState[k]=v));	// extend UrlState if not already done

