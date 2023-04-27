# This Works is placed under the terms of the Copyright Less License,
# see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.
#
# My code critically relies on Proxy().
# Hence we cannot transpile to ES5, as ES5 lacks Proxy() support.
#
# My Code also relies on other features,
# but there exists polyfills,
# which allow the code to run:
#
# ES6	Proxy:  No workaround possible in ES5
# ES6	WeakMap WeakSet:  ES5 workaround leaks memory.
# ES12	WeakRef: Workaround leaks memory.

V=13
TARG=md5c.js md5.js er6.js es6.js

# What happens if Babel fails?
# This is a babel bug not a bug of this!
# In that case, only md5c.js is created,
# and md5.js is missing.

.PHONY:	love
love:	all

.PHONY:	all
all:	$(TARG)

.PHONY:	clean
clean:
	$(RM) $(TARG) .md5c~

es6.js:	es$V.js babel.sh Makefile
	./babel.sh '$<' >'$@.tmp'
	mv '$@.tmp' '$@'

er6.js:	er$V.js babel.sh Makefile
	./babel.sh '$<' >'$@.tmp'
	mv '$@.tmp' '$@'

md5.js:	md5c.js babel.sh Makefile
	./babel.sh '$<' >'$@.tmp'
	mv '$@.tmp' '$@'

md5c.js:	md5c.js.in unroll.sh Makefile .md5c~
	./unroll.sh '$<' >'$@.tmp'
	mv '$@.tmp' '$@'

.md5c~:
	touch '$@'

