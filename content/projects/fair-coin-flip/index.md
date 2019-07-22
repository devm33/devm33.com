---
title: Fair Coin Flip
updated: 2019-05-20
image: screenshot.png
tagline: Flips a verifiably fair coin between two people with math!
tags: [number theory, cryptography]
link: http://devm33.github.io/fair-coin-flip/
repo: https://github.com/devm33/fair-coin-flip
---

This was a project for a number theory course (MATH 4150) I took at Georgia
Tech. I picked this project and chose to write it in javascript for the browser
because I liked the practical application of deciding a contest between two
parties randomly and securely without any trusted third party. The
implementation runs locally in a single browser using a toy number of bits to
support user-input at each step walking-through the procedure. A practical
application would take place between two browsers using a direct connection,
limiting user-input to initiating procedure, and perhaps re-implemented in
WebAssembly to support a higher number of bits for the keys to be secure.

# Algorithm

Consider the two parties Bob and Alice.

**1. Alice begins by generating two primes: `p` and `q`.**

Ideally these primes would be large enough to be secure prime factors but for
this implementation it defaults to five digits.

**2. Alice sends Bob the product of the two primes: `n = pq`.**

**3. Bob then choses a number `r`, less than `n` to use as a square root mod
`n`.**

I gathered this input via a slider for free entropy.

![screenshot of choosing square root](square_root.png)

**4. Bob then squares `r`, `r * r` mod `n` = `s` and sends `s` to Alice.**

At this point, Alice can use the knowledge of `n`'s prime factors `p` and `q` to
find all possible square roots of `s` mod `n` using [Cipolla's
algorithm][cipolla] Since `n` has two prime factors there will be four square
roots, two of which are negations of each other. This follows from the [Chinese
remainder theorem]. For looking up further on this `s` here is a [quadratic
residue].

[cipolla]: https://en.wikipedia.org/wiki/Cipolla%27s_algorithm
[quadratic residue]: https://en.wikipedia.org/wiki/Quadratic_residue
[chinese remainder theorem]:
  https://en.wikipedia.org/wiki/Chinese_remainder_theorem

**5. Alice solves `x * x = s mod n` for roots `a, -a, b, -b`.**

At this point, Alice does not know which of `a` or `b` is the root `r` that Bob
used to generate `s`.
