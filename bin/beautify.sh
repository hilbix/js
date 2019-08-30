#!/bin/bash
#
# Because I am too lazy to remember how

APP=uglifyjs
need() { which "$1" >/dev/null && return; echo "$1: not found" >&2; echo "Hint: You probably need module node-uglify" >&2; exit 23; }
need $APP

for a
do
	$APP "$a" -b beautify:true | less
done

