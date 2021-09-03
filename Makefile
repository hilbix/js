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
	st="$$(git status --porcelain)" && [ -z "$$st" ]
	git submodule update --recursive --init
	$(MAKE)

.PHONY:	test
test:
	st="$$(git status --porcelain)" && [ -z "$$st" ] || { git status; echo; echo ERROR: git status not clean; echo; false; }
	git remote update -p && h="`git rev-parse HEAD`" && m="`git rev-parse master`" && o="`git rev-parse origin/master`" && test ".$$h" = ".$$m" && test ".$$h" = ".$$o" || { echo "mismatch:"; echo "master $$m"; echo "head   $$h"; echo "origin $$o"; false; }
	git submodule foreach 'git remote update -p && h="`git rev-parse HEAD`" && o="`xx="$$name" bash -c "git rev-parse \\"origin/\\$${xx%%.*}\\""`" && test ".$$h" = ".$$o" || { echo "mismatch $$name:"; echo "HEAD   $$h"; echo "origin $$o"; false; }'
	$(MAKE)
	st="$$(git status --porcelain)" && [ -z "$$st" ] || { git status; echo; echo ERROR: git status not clean; echo; false; }
	echo && echo OK: local and remote git status look clean && echo

