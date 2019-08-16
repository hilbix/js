#!/bin/bash
#
# create all.js in the given directory by concatenating all direct soflinks.
#
# This Works is placed under the terms of the Copyright Less License,
# see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

o() { "$@" || exit; }

for a;
do
	for b in "$a/*";
	do
		case "$b" in (*.js) ;; (*) continue;; esac;	# ignore assets not ending on *.js
		[ -L "$b" ] || continue;			# ignore non-softlinks
		[ -d "$b" ] || continue;			# ignore subdirs, this are dynamic modules
		[ -s "$b" ] || continue;			# ignore empty files
		o printf '\n//\n// %q\n//\n' "$b";
		o cat "$b";
	done > "$a/all.js.new" || exit;
	o mv -f "$a/all.js.new" "$a/all.js";
done;

:	# signal success

