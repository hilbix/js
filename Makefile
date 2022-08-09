# This Works is placed under the terms of the Copyright Less License,
# see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

V=13

.PHONY:	love
love:	all

.PHONY:	all
all:	es5.js er5.js

es5.js:	es$V.js babel.sh Makefile
	./babel.sh "$<" >"$@"

er5.js:	er$V.js babel.sh Makefile
	./babel.sh "$<" > "$@"

