#!/usr/bin/env bash

# hit the update all button:
# generates index.html and sends it and related to devm33:
# also autocommits to git repo
#
# relies on ./to_devm33, ./gen_index.sh, and git

./gen_index.sh;

./to_devm33 index.html style.css inline.js;

git add -A;

git commit -m "website changes pushed live $(date)";

