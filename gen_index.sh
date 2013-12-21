#!/usr/bin/env bash

# script to generate index.html and index.html.gz

# vars
CSSFILE='style.css';
HTMFILE='template.index.html';
JSFILE='inline.js';
YUIC='java -jar /home/devraj/Code/yuicompressor/yuicompressor.jar';
OUTFILE='index.html';

# minify
export CSS=$($YUIC $CSSFILE);
export JS=$($YUIC $JSFILE);

# compile
perl -p -e 's/\$\{(\w+)\}/(exists $ENV{$1}?$ENV{$1}:"missing variable $1")/eg' < $HTMFILE > $OUTFILE;

#compress
gzip -c --best --force $OUTFILE > ${OUTFILE}.gz;
