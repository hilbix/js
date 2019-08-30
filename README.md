[![push status](https://api.cirrus-ci.com/github/hilbix/js.svg?branch=master)](https://cirrus-ci.com/github/hilbix/js/master)

> **Warning!**  Everything in `js/all.js` probably will change as this evolves.
>
> If in doubt, either create your own `js*` or do not use `all.js` and use the individual snippets.


# Javascript Snipptes

All my Javascript needs, bundled into one single repo with submodules.


## HowTo

Prep:

	git init	# usually already done
	git submodule add https://github.com/hilbix/js.git sub/lib
	git submodule update --recursive --init sub/lib

Use:

	ln -s --relative sub/lib/js /var/www/html/js

HTML:

	<script src="/js/all.js"></script>

Update/Edits/etc.:

	make -C sub/lib update

Notes:

- This is meant as a `git submodule`
- This repo might change drastically, better fork before use
- Some things might be very experimental
- The `<script>` tag might change over time
- `js*/all.js` is created by `make`, so you can create your own `js*` bundles
- `js/all.js` usually is not what you want!  Only pick what you need


## Naming

`js/X.js` defines namespace `X`.

- A module wich provides `window.X` should be found at `js/X.js`
- Other modules should use a dash (`-`) in their name.  The only exception is `js/all.js`
- Assets of `js/X.js` shall be in `js/X/`, `css/X.css`, `img/X/` etc.
- Softlinks are your friend.

Reserved names:

- Uppercase names are reserved for classes.
- Names starting with a dot or a digit.
- `$` is reserved for future loader functions as an alias of `/`.  
  (`Main$Class` then is searched under `js/Main/Class.js`)


## Hacks/Quirks

- Submodules branches are currently a hack:
  - If the submodule is named `name.BRANCH`, then the branch `BRANCH` is used.
  - If the submodule is named `name` (without a dot), then the branch `name` is used.
  - In future, perhaps I will parse `.gitmodules` to take the branch from there.


## FAQ

WTF why?

- Because I want it.


Documentation?

- See source.


Submodule links missing.

- [This is a github bug](https://github.community/t5/How-to-use-Git-and-GitHub/Support-Linking-Relative-URL-s-on-submodules/td-p/24650)
- Try switching branches instead.


License?

- **Warning!**  This License does not extend to submodules!

- This Works is placed under the terms of the Copyright Less License,
  see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

- Read:  This is free as in free beer, free speech and free baby.


AMD?  UMD?  CommonJS?

- [Würg!](https://en.wikipedia.org/wiki/Pharyngeal_reflex)


Minified?

- Did not yet consider that, as is makes debugging more difficult.
  No, debugging is not just reading/presenting, debugging is edit+test as well.
- Minification must be done with official standard Debian packages only, else I will never use it.
  So no, I repeat, absolutely no external references or downloads or requirements, except pure `apt-get`.
- Minification could be done with the help of Cirrus-CI and external references as well.
  However I refuse to use other CIs because they are [hanebüchen](https://de.wikipedia.org/wiki/Haneb%C3%BCchen).
  ("hanebüchen" is my word for outrageously and intentionally done grossly negligent bad design)


Contact?  Bug?

- Open issue at GitHub.
- Eventually I listen.


Contrib?  Patches?

- PR at GitHub.
- Eventually I listen.
- Note that your patches must conform to the License.


Platforms without softlinks?  (Like Windows)

- Try again with something more reasonable.

