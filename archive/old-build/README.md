Old Build process for devm33
======

This build process was very handmade and not at all scalable. Switching over
to Jekyll was a big win for actually trying to maintain more than a single
web-page.

But nonetheless this handmade build process was a unique amalgamation of 
disparate, mostly custom, tooling and I got to learn a lot of random tidbits
making it and using it -- which is always a good thing. So I'm keeping it here
for posterity. (And because it makes the language breakdown on the github page
look more interesting.)

---

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

