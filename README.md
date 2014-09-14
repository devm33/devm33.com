devm33
======

personal website

 - mainly on github as a backup of the content
 - with some assorted utils and supplementary files

live here: http://devm33.com

_Note to self:_ In order to use upall script and git repo on server remotes
should be:

    $ git remote -v

    hub git@github.com:devm33/devm33.git (fetch)
    hub git@github.com:devm33/devm33.git (push)
    nfs devm33_devm33@ssh.phx.nearlyfreespeech.net:/home/private/devm33.git (fetch)
    nfs devm33_devm33@ssh.phx.nearlyfreespeech.net:/home/private/devm33.git (push)

Dependencies:
----

- upall.sh
    - git
    - gen_index.pl
        - perl
        - HTML::TreeBuilder::XPath

                $ cpan HTML::TreeBuilder::XPath

        - gzip
        - java
        - util/yuicompressor-2.4.8.jar

