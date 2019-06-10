---
title: Countdown Solver
updated: 2019-05-29
image: countdown.png
tagline: >
  Generates and solves Countdown numbers round with a BFS search in a web
  worker. Renders solution graphs with d3.
tags: [d3, svg, react, webworker]
link: https://devm33.github.io/countdown/
repo: https://github.com/devm33/countdown
---

[_Countdown_](<https://en.wikipedia.org/wiki/Countdown_(game_show)>) is a long
running game show on the BBC. It consists of three types of rounds: letters
rounds, numbers rounds, and a final anagram round. The letters round consists of
trying to make the longest word out of a pool of nine random letters.
Similarily, the final round consists of all contestants trying to figure out a
single nine-letter anagram. The numbers round is the one I focused on for this
project.

As a side note, I discovered _Countdown_ via a cross-over with _8 out of 10
Cats_

![Cats does Countdown title card](./cats_does_countdown.jpg)
