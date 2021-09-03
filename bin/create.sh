#!/bin/bash
#
# create all.js in the given directory by concatenating all direct soflinks.
#
# This Works is placed under the terms of the Copyright Less License,
# see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

MAXSIZE=50000

o() { "$@" || exit; }

REMOTE="$(git config --get remote.origin.url)"
REMOTE="${REMOTE/\/*@/\/\/}"	# remove confusing access token if any

for a;
do
	{
	printf '/// automatically generated%s%q ///\n' "${REMOTE+ from }" "$REMOTE"
	for b in "$a/"*.js;
	do
		[ -L "$b" ] || continue;			# ignore non-softlinks
		[ -d "$b" ] && continue;			# ignore subdirs, this are dynamic modules
		[ -s "$b" ] || continue;			# ignore empty files
		case "$(head -3 "$b")" in
		(*STANDALONE*)	continue;;			# ignore STANDALONEs
		esac
		[ $MAXSIZE -gt "$(wc -c < "$b")" ] || continue	# too big to include

		o printf '\n/// %q ///\n\n' "$b";
		o cat "$b";
	done
	} > "$a/all.js.new" || exit;
	cmp -s "$a/all.js.new" "$a/all.js" && { rm -f "$a/all.js.new"; continue; };
	o mv -vf "$a/all.js.new" "$a/all.js";
done;

:	# signal success

