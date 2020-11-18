#!/bin/bash
#
# https://github.com/hilbix/tino/blob/master/howto/debian/babel.md
#
# WTF?  Is the complete planet off the trolley?
#
# - Babel uses 'require' instead of just including the neccessary code.
# - And all bundlers capable of expanding require() create a module out of top level code.
#
# In combination this is a complete big ugly fail.  What we need:
#
# Some script is written in ES99999999999999999999999999999999999999999999999999999999999999999999999999999999
# running fine in Firefox/Chrome version 9999999999999999999999999999999999999999999999999999999999999999999.0 but not below.
# The script is not a module, not something else or anything.  Just a normal plain top level window-namespace polluting script.  But working!
# And it should be transpiled to ES5 to run on old browsers.  WITH NO CHANGES WHATSOEVER TO OTHER COMPONENTS EXCEPT THE SCRIPT!
#
# Hence no modules.  No html changes.  No nothing not no no nononononooooooooo!
#
# COMPLETE FAIL:
#
# - Most Transpilers are so old (read: 1 feature behind), such they are not capable to properly tranform working code into ES5.
#   - The only one working seems to be Babel, but Babel uses require() to include missing parts.  WTF?
# - For require() you need bundlers, but those always transform the input into modules.  WTF WHY?
#   - Hence the result will never work in ES5, as modules are not understood in ES5.
#
# Solution:
#
# - Re-invent the wheel by providing my own 'require' expansion wraper.
# - Stay with the fact that we do not use nor occupy 'require' at the top level.
#
# What a shame!
#
# This Works is placed under the terms of the Copyright Less License,
# see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

PRESETS=@babel/preset-env
PLUGINS=@babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-class-properties,@babel/plugin-transform-runtime
BABEL=(babeljs --source-type=script --presets "$PRESETS" --plugins "$PLUGINS" "$1")
SCRIPTSRC="$1"

STDOUT() { local e=$?; [ 0 = $# ] || printf '%q' "$1"; [ 1 -lt $# ] && printf ' %q' "${@:2}"; printf '\n'; return $e; }
STDERR() { local e=$?; STDOUT "$@" >&2; return $e; }
OOPS() { STDERR OOPS: "$@"; exit 23; }
DEBUG() { local e=$?; return $e; }
x() { DEBUG exec: "$@"; "$@"; DEBUG rc=$?: "$@"; }
o() { x "$@" || OOPS fail: "$@"; }
v() { local -n __v="$1"; local __e; __v="$("${@:2}" && echo x)"; __e=$?; __v="${__v%%x}"; __v="${__v%$'\n'}"; return $__e; }
ov() { o v "$@"; }
xv() { x v "$@"; }
OUT() { "${@:2}" >"$1"; }

ov TMP tempfile
trap 'rm -f "$TMP"' 0

STDERR
o OUT "$TMP" "${BABEL[@]}"
STDERR
STDERR feel free to ignore: caniuse-lite is outdated
STDERR

ov BASE readlink -e .
INCPATH=("$BASE/" /usr/lib/nodejs/ /usr/share/nodejs/)

detect()
{
  (
  o cd "$1"
  case "$2" in
  (./*|../*)	LIST=('');;
  (*)		LIST=("${INCPATH[@]}");;
  esac

  for a in "${LIST[@]}"
  do
    b="$a$2"
    [ -f "$b/package.json" ] &&
    xv p python3 -c 'import json; import sys; print(json.load(open(sys.argv[1]))["main"])' "$b/package.json" &&
    o readlink -e "$b" && o readlink -e "$b/$p" && exit

    [ -f "$b.js" ]		&& o readlink -m "$b" && o readlink -e "$b.js"	&& exit
    [ -f "$b/index.js" ]	&& o readlink -e "$b" && o readlink -e "$b/index.js"	&& exit
  done
  exit 1
  )
}

require()
{
  local d f p
  ov d readlink -e -- "$1"
  ov f readlink -e -- "$2"
  while read -ru6 line
  do
    ov pf detect "$d" "$line"
    p="${pf%%$'\n'*}"			# 1st line ist the "require" arg
    f="${pf##*$'\n'}"			# 2nd line is the real file
    for a in "${INCPATH[@]}"		# remove common prefix from "require" arg
    do
      p="${p#"$a"}"			# only the first matching prefix is removed as $a looks like /path/
    done
    [ -z "${REQ["$p"]}" ] || continue	# include already known

    REQ["$p"]="$f"
    o require "${f%/*}" "$f" 6<&-
  done 6< <(o sed -n "s/^.*\<require(['\"]\([^'\"]*\)['\"]).*$/\1/p" "$f")
}

bundle()
{
out // DEBUG "<script src=\"$SCRIPTSRC\" data-debug></script>"
o cat <<EOF
window.require = (function(orig, _)
  {
    var r = [];
    function require(x, p)
      {
        // relative paths
        if (x.substr(0,2)=='./' || x.substr(0,3)=='../')
          x = p + '/' + x;

        // canonicalize path
        x = x.split('/');
        p = [];
        while (x.length)
          {
            var t = x.shift();
            if (t=='' || t=='.') continue;
            if (t=='..') p.pop(); else p.push(t);
          }
        x = p.join('/');

        // if not bundled, forward to others
        if (!_[x])
          {
            if (orig)
              return orig(x);
            throw 'require(): not found: '+x;
          }

        // include CommonJS module
        var m = { id:x, exports:{} };
        p = _[x][0];
        _[x][1](m, function(x) { return require(x, p) });

        if (document.currentScript && document.currentScript.dataset && document.currentScript.dataset.debug)
          console.log('require', x, p, m.exports);

        return m.exports;
      }
    return function(x) { return r[x] || (r[x]=require(x, '')) };
  })(window.require,
EOF

first='{'
for a in "${!REQ[@]}"
do
  p="${REQ["$a"]%"$a"*}"
  p="${REQ["$a"]#"$p"}"
  o printf '%s "%s":["%s", function(module,require) { // %s\n' "$first" "$a" "${p%/*}" "$p"
  o cat "${REQ["$a"]}"
  o printf '\n}]\n'
  first=,
done
printf '}'

o cat <<EOF
);
EOF
}

out()
{
  printf '%s' "$1"
  [ 1 -ge $# ] || printf ' %-7s' "$2"
  [ 2 -ge $# ] || printf ' %s' "${@:3}"
  printf '\n'
}

out "'use strict';"
out // Bundled by:
out // script $(git ls-files --full-name "$0")
out // GIT    $(git config --get remote.origin.url)
out // branch $(git rev-parse --abbrev-ref HEAD)
out // SHA    $(git rev-parse HEAD)

declare -A REQ
o require . "$TMP"

for a in "${!REQ[@]}"
do
  o bundle
  break
done

out // BABEL "${BABEL[@]}"

o cat "$TMP"

