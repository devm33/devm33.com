#!/usr/bin/env bash

# hit the update all button:
# generates index.html and sends it and related to devm33:
# also autocommits to git repo with all arguments supplied
# as the note on the commit.
#
# relies on ./gen_index.pl, and git (being on the master branch)

function die {
    echo "error in $1 stopping" >&2;
    exit 1;
}

# compile and minify html
perl gen_index.pl || die "gen_index.pl";

# use git to do our remote file managment

# requires us to be on master branch
if [ 'master' != "$(git branch | sed -n '/^\* /s///p')" ];
    then
    echo "error, you need to be on the master branch to deploy, stopping" >&2;
fi

# autocommit any pending changes
git add -A;
if [ -z "$(git status --porcelain)" ];
    then
    echo "no changes, stopping" >&2;
    exit 0;
fi

# take prepend any params to this script to commit message
NOTE="";
if [ $# -gt 0 ]
    then
    NOTE="$@ -- ";
fi

git commit -m "${NOTE}website changes pushed live $(date)" || die "git commit";

# first deploy to website then github
git push nfs master || die "git push nsf";

git push hub master || die "git push hub";

