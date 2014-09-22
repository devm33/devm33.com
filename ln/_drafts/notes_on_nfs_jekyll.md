Some notes on what was needed to run jekyll on nearlyfreespeech servers
=====

Gem install setup
----

By default ruby and rubygems are available, but the default gem install
location is not writable from a user account. In order to work around this
set up gem to install into your home directory:

~~~ bash
export GEM_HOME=/home/private/gems
export GEM_PATH=/home/private/gems:/usr/local/lib/ruby/gems/1.8/
export PATH=$PATH:/home/private/gems/bin
export RB_USER_INSTALL='true'
~~~

Which I conveniently found the jekyll docs themselves:
<http://jekyllrb.com/docs/troubleshooting/>

Then on that shell install jekyll

    gem install jekyll

In order to run the jekyll just installed it needs to be found in 

    /home/private/gems/bin/jekyll

This may be useful to prepend to your PATH for convenience.

In any case the next issue I came across was not having a valid javascript
runtime.

~~~
/home/private/gems/gems/execjs-2.2.1/lib/execjs/runtimes.rb:51:in `autodetect': Could not find a JavaScript runtime. See https://github.com/sstephenson/execjs for a list of available runtimes. (ExecJS::RuntimeUnavailable)
~~~

After some cursory perusal it appeared installing node was hard, but since the
gem environment was all set up it made sense to use a ruby alternative. 
`execjs` was the rubygem complaining about not being able to find a runtime and
on its github page serveral alteratives are listed: 
<https://github.com/sstephenson/execjs#execjs> I went with `therubyracer` since
it was recommended by the jekyll docs ([see that helpful troubleshooting page 
again](http://jekyllrb.com/docs/troubleshooting/#could-not-find-a-javascript-runtime-execjsruntimeunavailable)

