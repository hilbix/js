#

.PHONY:	love
love:	all

.PHONY:	all
all:	es5.js er5.js

es5.js:	es11.js babel.sh Makefile
	./babel.sh "$<" >"$@"

er5.js:	er11.js babel.sh Makefile
	./babel.sh "$<" > "$@"

