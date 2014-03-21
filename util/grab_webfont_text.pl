#!/usr/bin/env perl

# script to grab the text that will be using a webfont from html file

use strict;
use warnings;

use HTML::TreeBuilder::XPath;

# vars
my $fontclass = 'webfont'; # name of the trigger class
my $htmlfile = '../template.index.html'; # html file to parse

# parse html file into XPath tree
my $tree = HTML::TreeBuilder::XPath->new;
$tree->parse_file($htmlfile);

# grab the text of all subnodes of tags with the class
my $text = '';
for my $node ($tree->findnodes('//*[@class="' . $fontclass . '"]')) {
    $text .= $node->findvalue('./*');
}

# done with html, clean up
$tree->delete;

# remove whitespace - webfont api would break / doesnt need them
$text =~ s/\s//g;

# remove repeated characters with a little perl regex love
1 while($text =~ s/(\w+)(.*)\1/$1$2/g);

# print
print "$text\n";

