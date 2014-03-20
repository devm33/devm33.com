#!/usr/bin/env bash

# hit the update all button:
# generates index.html and sends it and related to devm33:
# also autocommits to git repo with all arguments supplied
# as the note on the commit.
#
# relies on ./to_devm33, ./gen_index.pl, and git


# compile and minify html
perl gen_index.pl;
if [ $? -ne 0 ];
    then
    echo "error in gen_index, stopping";
    exit 1;
fi

# send modified files
git add -A;
FILES=$(git status --porcelain | cut -d ' ' -s -f 3);
if [ -z "${FILES}" ];
    then
    echo "no changes. exiting...";
    exit 0;
fi

#TODO if a file is deleted it will be caught in this list
# 1: need to not send it
# 2: would be neat to delete it on remote

echo "sending ${FILES}";
bash to_devm33 ${FILES};
if [ $? -ne 0 ];
    then
    echo "error in to_devm33, stopping";
    exit 1;
fi

# autocommit [with note]
NOTE="";
if [ $# -gt 0 ]
    then
    NOTE="$@ -- ";
fi

git commit -m "${NOTE}website changes pushed live $(date)";

git push;

