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

.PHONY:	love
love:	all

.PHONY:	all
all:	es6.js er6.js

es6.js:	es$V.js babel.sh Makefile
	./babel.sh "$<" >"$@"

er6.js:	er$V.js babel.sh Makefile
	./babel.sh "$<" > "$@"

