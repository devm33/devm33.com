---
title: "Git Hooks"
categories: git automation
---

## .git/hooks/

Git hooks are awesome. On a team I used to work in we kept a post-it note on
our sprint board for the task of "Automate Everything." While it did have
infinity story points it has remained a mantra that I work towards everyday.

As part of that effort I have found that git hooks are particularly useful.
Since the entirety of my software development inside and outside work is
tracked in git it's a natural place to automate aspects of the development
workflow, especially any part of the git workflow.

So here's a quick post about where and how I use git hooks. The overall how
is very simple and straightforward:

1. Write a script to automate a part of the workflow that occurs before
after any particular git action.

1. Symlink that script to a file in `.git/hooks/` named for the git action
being used as a signal as documented here: 
<http://git-scm.com/docs/githooks>

1. Enjoy life automated.

## prepare-commit-msg

TODO jira ticket numbers

## post-receive

TODO build process for devm33

## pre-commit

TODO sendmail jshint, console.log grep, sass production

