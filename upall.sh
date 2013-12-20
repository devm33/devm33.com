#!/usr/bin/env bash

# hit the update all button:
# generates index.html and sends it and related to devm33:
# also autocommits to git repo with all arguments supplied
# as the note on the commit.
#
# relies on ./to_devm33, ./gen_index.sh, and git


# compile and minify html
./gen_index.sh;

# send modified files
FILES=$(git status --porcelain | cut -d ' ' -s -f 3);
if [ -z ${FILES} ];
    then
    echo "no changes. exiting...";
    exit 0;
fi
echo "sending ${FILES}";
./to_devm33 ${FILES};

# autocommit [with note]
git add -A;

NOTE="";
if [ $# -gt 0 ]
    then
    NOTE="$@ -- ";
fi

git commit -m "${NOTE}website changes pushed live $(date)";

git push;

