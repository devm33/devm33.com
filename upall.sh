#!/usr/bin/env bash

# hit the update all button:
# generates index.html and sends it and related to devm33:
# also autocommits to git repo with all arguments supplied
# as the note on the commit.
#
# relies on ./to_devm33, ./gen_index.pl, and git

function die {
    echo "error in $1 stopping" >&2;
    exit 1;
}

# compile and minify html
perl gen_index.pl || die "gen_index.pl";

# send modified files
git add -A;
if [ -z "$(git status --porcelain)" ];
    then
    echo "no changes. exiting...";
    exit 0;
fi

#TODO if a file is deleted it will be caught in this list
# 1: need to not send it
# 2: would be neat to delete it on remote

# TODO migrating this to git -- no need to reinvent the wheel



echo "sending ${FILES}";
bash to_devm33 ${FILES} || die "to_devm33";

# autocommit [with note]
NOTE="";
if [ $# -gt 0 ]
    then
    NOTE="$@ -- ";
fi

git commit -m "${NOTE}website changes pushed live $(date)" || die "git commit";

git push;

