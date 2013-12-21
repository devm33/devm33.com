#!/usr/bin/env perl

# script to generate index.html

# vars
my $cssfile = 'style.css';
my $htmlfile = 'template.index.html';
my $jsfile = 'inline.js';
my $yuic = 'java -jar /home/devraj/Code/yuicompressor/yuicompressor.jar';
my $outfile = 'index.html';

# minify
my $css = system( $yuic $cssfile );
my $js = system( $yuic $jsfile );

# compile
my $html =~ s/\$\{(\w+)\}/(exists $ENV{$1}?$ENV{$1}:"missing variable $1")/eg;
open(my $out, '>', $outfile);
print($out, $html);
close($out);

# compress TODO
