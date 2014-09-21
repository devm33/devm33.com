#!/usr/bin/env perl

# script to generate index.html and index.html.gz

use strict;
use warnings;

# vars
my $cssfile = 'style.css';
my $htmlfile = 'template.index.html';
my $jsfile = 'inline.js';
my $yuic = 'java -jar util/yuicompressor-2.4.8.jar';
my $outfile = 'index.html';
my %map = ();
my ($in, $out, $html);

# minify
$map{"CSS"} = `$yuic $cssfile`;
$map{"JS"} = `$yuic $jsfile`;
$map{"WEBFONTCHARS"} = grabchars();
$map{"S3"} = 'https://s3.amazonaws.com/devm33';

# compile
open $in, '<', $htmlfile or die "error opening $htmlfile: $!";
$html = do { local $/; <$in> };
close $in or die $!;
1 while($html =~ s/\$\{(\w+)\}/(exists $map{$1}?$map{$1}:"missing variable $1")/eg);

open $out, '>', $outfile or die "error opening $outfile: $!";
print $out $html;
close $out or die $!;

# compress
system("gzip -c --best --force $outfile > ${outfile}.gz");

# subroutine to grab the text that will use a webfont in html file
sub grabchars {
    use HTML::TreeBuilder::XPath;
    
    my $fontclass = 'webfont'; # name of the trigger class

    # parse html file into XPath tree
    my $tree = HTML::TreeBuilder::XPath->new;
    $tree->parse_file($htmlfile);

    # grab the text of all subnodes of tags with the class
    my $text = '';
    for my $node ($tree->findnodes('//*[@class="' . $fontclass . '"]')) {
        $text .= $node->findvalue('.');
    }

    # done with html, clean up
    $tree->delete;

    # remove whitespace - webfont api would break / doesnt need them
    $text =~ s/\s//g;

    # remove repeated characters with a little perl regex love
    1 while($text =~ s/(\w+)(.*)\1/$1$2/g);

    return $text;
}
