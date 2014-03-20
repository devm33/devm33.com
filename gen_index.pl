#!/usr/bin/env perl

# script to generate index.html and index.html.gz

use strict;
use warnings;

# vars
my $cssfile = 'style.css';
my $htmlfile = 'template.index.html';
my $jsfile = 'inline.js';
my $yuic = 'java -jar ./util/yuicompressor.jar';
my $outfile = 'index.html';
my %map = ();
my ($in, $out, $html);

# minify
$map{"CSS"} = `$yuic $cssfile`;
$map{"JS"} = `$yuic $jsfile`;

# compile
open $in, '<', $htmlfile or die "error opening $htmlfile: $!";
$html = do { local $/; <$in> };
close $in or die $!;
$html =~ s/\$\{(\w+)\}/(exists $map{$1}?$map{$1}:"missing variable $1")/eg;

open $out, '>', $outfile or die "error opening $outfile: $!";
print $out $html;
close $out or die $!;

# compress
system("gzip -c --best --force $outfile > ${outfile}.gz");
