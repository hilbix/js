[![push status](https://api.cirrus-ci.com/github/hilbix/js.svg?branch=master)](https://cirrus-ci.com/github/hilbix/js/master)

> **Warning!**  Everything in `js/all.js` probably will change as this evolves.
>
> If in doubt, either create your own `js*` or do not use `all.js` and use the individual snippets.

Note:

- **The real development (and the best benefit) mostly is in branch [es12](../../tree/es12)**
- If you want to see something which uses this, see <https://github.com/hilbix/minion>


# Javascript Snippets

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
  - If the submodule is named `BRANCH.name`, then the branch `BRANCH` is used.
  - If the submodule is named `name` (without a dot), then the branch `name` is used.
  - In future, perhaps I will parse `.gitmodules` to take the branch from there.


## FAQ

WTF why?

- Because I want it.


Documentation?

- See source.


Submodule links missing on GitHub.

- `git clone --recursive` works
  - tested with `git 1.20.1` (2021-09-03)
  - tested with `git 2.30.2` (2022-08-09)
- [For me this is one of the major bugs of GitHub](https://github.blog/changelog/2021-03-19-hyperlink-support-for-submodules-with-relative-paths/)
  - Warning!  The link above may evaproate 0.001 as (=atto-seconds) after I post this
  - [like the old link to my bug vanished](https://github.community/t5/How-to-use-Git-and-GitHub/Support-Linking-Relative-URL-s-on-submodules/td-p/24650), too (it's not in archive.org either).
- I cannot use `../js` (as noted in the [blog entry link above](https://github.blog/changelog/2021-03-19-hyperlink-support-for-submodules-with-relative-paths/)) as this **will be wrong in allmost all situations** except this lonely place at GitHub here.
  - GitHub should support what `git` supports, how `git` works and [how `git` is used](https://stackoverflow.com/questions/64810428/can-i-use-git-submodule-within-the-same-repository),
  - and abstain to offer some proprietary standard, which makes repositories unusable in the real world outside of GitHub.
  - `git clone --recursive` fails at my side if I use `../js`
  - Because I use `git config url.X.insteadOf Y` a lot which gets confused by `..` paths
  - (which is not a `git` bug, as `git` does the very right thing.  This only has trouble with GitHub's interpretation of reality)
  - I could fix this, of course on `git` level
  - but why should I fix some proprietary GitHub problem which only shows up due to some issue introduced by GitHub due to some lack of compatibility to `git` in their presentation?
- This is not the only place where I use this (very well known and supported) feature of `git`, which is incompatible with GitHub's presentation.
  - **Perhaps you can help and persuade (=pressure) GitHub to add support for `.` paths of repositories.**
  - I won't do.  Why should I?  It just only affects you (the other 8+ billion people) and not me.
- FYI:
  - Using something like `../js` forces you to use the name I have chosen.  For now and in future.
  - This also kills extremely important features like `git bisect`
  - So using "GitHub relative URLs" is wrong in almost all possible cases.
- **Please abstain from using relative '../' repository-URLs in public GitHub repos!
  - These sort of relative links are a PITA.
- **Thank you very much** for your understanding!
- BTW:
  - Relative links - as offered by GitHub - are still good for you.
  - But only if you use and rely on GitHub, GitHub, or similar, as most do.
  - But `git` is so much more than [just those singularities](https://de.wikipedia.org/wiki/Polstelle)!

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

