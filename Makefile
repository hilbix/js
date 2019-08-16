# This Works is placed under the terms of the Copyright Less License,
# see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

.PHONY:	love
love:	all

.PHONY:	all
all:	js

.PHONY:	js
js:
	bin/create.sh js*

.PHONY:	update
update:
	git remote update -p
	git merge --ff-only origin/master
	st="$(git status --porcelain)" && [ -z "$st" ]
	git submodule update --recursive --init
	$(MAKE)

