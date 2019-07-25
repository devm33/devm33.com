---
title: 4Clojure for learning Clojure
updated: 2015-06-07
image: screenshot.png
tagline: Completed all of the problems on 4clojure.com
tags: [clojure]
link: http://www.4clojure.com/user/devm33
repo: https://github.com/devm33/4clojure_problems
---

## I completed all of the 4clojure problems!

After four weeks of consistent focus I made it through all 156 problems on
[4clojure.com][4clojure] Proof: [my user page][devm33] and [list of top
users][users].

You can see most of my solutions in the [github repo][github] I used for this
project. I limited adding problems to the repo to those that I needed to develop
inside the editor to solve. Some problems were simple enough to solve on the
website textbox so I skipped adding those to the repo. The ones in the repo
should be the more interesting problems.

I'd like to share some of my favorite problems and solutions. _Warning:_ these
are spoilers for 4clojure, of course. If you're interested in learning clojure
I'd highly recommend not reading this post and attempting the problems without
looking at any answers. The problems start with the basics of the language and
build up to substantive and challenging coding exercises in their own right. A
set of unit tests accompanies each problem. Once you solve a problem you can see
all of the other successful solutions. This is great for benchmarking yourself
and picking up other people's tricks.

This was my first adventure into clojure and I found the 4clojure problems great
for motivating me through the initial learning curve, perhaps a bit past it. Of
course, after 4 weeks I'm certainly still a beginner with clojure so I welcome
any feedback!

## Fibonacci

<http://www.4clojure.com/problem/26>

The classic Fibonacci series problem. A goto for learning new languages, in
particular functional languages. This was the first problem I had to write down
because I kept tripping myself with how `conj` adds to the beginning of lists.
This frustration is apparent in my submitted solution.

```clojure
(defn fib [n]
  (if (< n 3)
    (repeat n 1)
    (let [prev (reverse (fib (dec n)))]
      (reverse (conj prev (+ (first prev) (second prev)))))))
```

This approach works but is clunky and far from efficient. Knowing what I know
now I'd opt for using a lazy sequence.

```clojure(defn fib [n]
  (letfn [(fib [a b] (cons a (lazy-seq (fib b (+ a b)))))]
    (take n (fib 1 1))))
```

Another good approach would be using `loop` and `recur` because clojure doesn't
tail optimize without use of `recur`.

```clojure
(defn fib [n]
  (loop [remain n ret [] a 0 b 1]
    (if (= 0 remain) ret
      (recur (dec remain)
             (conj ret a)
             b
             (+ a b)))))
```

## Replicate a sequence

<http://www.4clojure.com/problem/33>

While I came up with the alternative fibonacci solutions above, I often saved
other user's solutions alongside mine as well. For example, let's take problem
33: repeating each element in a series. This was my solution:

```clojure
(defn repf [col num]
  (reduce #(concat %1 (repeat num %2)) '() col))
```

While there's nothing wrong with my solution per se I learned a better
alternative from another user ([\_pcl][pcl]). Their solution uses a core API
call that does part of what I was doing: [mapcat][mapcat].

```clojure
(defn repf [col num]
  (mapcat (partial repeat num) col))
```

Insights like this from other users' solutions were tremendously useful in
learning different parts of the clojure APIs.

## Sequence Reductions

<http://www.4clojure.com/problem/60>

Another place that I got great feedback was the clojure source code. Some of the
4clojure problems consist of re-implementing core functions which prompted me to
look at the actual implementations. The clojure docs link to the relevant line
in the source. I appreciate when documentation links to the source it's
describing.

<https://clojuredocs.org/clojure.core/reductions> See the link to source in the
top right under clojure.core.

<https://github.com/clojure/clojure/blob/clojure-1.6.0/src/clj/clojure/core.clj#L6628>

```clojure
(defn reductions
  "Returns a lazy seq of the intermediate values of the reduction (as
  per reduce) of coll by f, starting with init."
  {:added "1.2"}
  ([f coll]
     (lazy-seq
      (if-let [s (seq coll)]
        (reductions f (first s) (rest s))
        (list (f)))))
  ([f init coll]
     (cons init
           (lazy-seq
            (when-let [s (seq coll)]
              (reductions f (f init (first s)) (rest s)))))))
```

I found the clojure source readable and approachable. Once I started reading the
source for the core function problems I started referencing it for other
problems as well.

## Prime Numbers

<http://www.4clojure.com/problem/67>

I didn't learn anything in particular from this problem. I love this method of
testing primality.

```clojure
; first n prime numbers
; sneaky regex version ;]

(defn __ [n]
  (take
    n
    (filter
      #(empty? (re-matches #"^1?$|^(11+?)\1+$" (apply str (repeat % "1"))))
      (range))))
```

Naming the solution function `__` double underscores was a trick that I picked
up to make copying and pasting the test cases from 4clojure quicker.

```clojure
(assert (= (__ 2) [2 3]))

(assert (= (__ 5) [2 3 5 7 11]))

(assert (= (last (__ 100)) 541))
```

I used a vim mapping for adding the `assert`s. The vim set up for clojure should
probably be a post to itself because that took a minute.

## Language of a DFA

<http://www.4clojure.com/problem/164>

The problems on 4clojure have four tiers of difficulty: elementary, easy,
medium, and hard. Elementary and easy often were possible to solve in the editor
on website, sometimes in one line or one word. The medium and some of the hard
were great for making me think a little deeper about the language and use it a
more thoroughly in a substantive problem. The last ten or so of the hard
category, however, were a different kind of beast entirely. While I was able to
solve the first 140 problems in the first three weeks, the last dozen or so
problems took up a disproportionate amount of time. I enjoyed them. They were
legitimately difficult.

One of my favorite problems from this group asks to produce the language of
[deterministic finite automaton (DFA)][dfa]. The class that introduced me to
formal languages and their machines was one of my favorite in college, so I'm
always excited to see something like a DFA come up. I also like this problem
because it makes use of lazy execution which is readily available in clojure.

```clojure
(defn __ [dfa]
  (letfn
    [(map-trans [cur trans]
       (when trans
         (map (fn [[t s]] {:state s :path (str (:path cur) t)}) trans)))
     (enq [trails]
       (when (not-empty trails)
         (lazy-seq
           (let [cur (first trails)
                 next-trans (get-in dfa [:transitions (:state cur)])
                 next-trails (concat (rest trails) (map-trans cur next-trans))]
             (if ((:accepts dfa) (:state cur))
               (cons (:path cur) (enq next-trails))
               (enq next-trails))))))]
    (enq [{:state (:start dfa) :path ""}])))

(assert (= #{"a" "ab" "abc"}
           (set (__ '{:states #{q0 q1 q2 q3}
                      :alphabet #{a b c}
                      :start q0
                      :accepts #{q1 q2 q3}
                      :transitions {q0 {a q1}
                                    q1 {b q2}
                                    q2 {c q3}}}))))
```

At each step in the recursion, I pass down a sequence of substring objects,
`trails`, to use as a queue. For the first substring out of this queue, I
enqueue all the states to which the DFA could transition from that the state of
that substring. Before recurring I check if the DFA accepts the current
substring by checking its state. If so, I add it to the lazy sequence. Either
way, I recurse with the new queue of substrings and states `next-trails`.

While the problem wasn't the hardest of the hard (see [140][140], [152][152], or
[127][127]) it's a great example of the progress of my clojure writing at the
end of these four weeks. I enjoyed using these aspects of the language:

- hashmap objects

  ```clojure
  {:state (:start dfa) :path ""}
  ```

- keywords as getter functions from hashmap objects

  ```clojure
  (:start dfa)
  ```

- argument destructuring

  ```clojure
  (map
    (fn [[t s]]
      ; Accepts a key-value pair for each character
      ; state pair in the iterated map of transitions
      {:state s :path (str (:path cur) t)})
    trans)
  ```

- the `let` macro's first-to-last evaluation

  ```clojure
  (let [cur (first trails)
        next-trans (get-in dfa [:transitions (:state cur)])
  ```

- and as I mentioned already the availability of lazy evaluation functions

I had a lot of fun going through 4clojure and I am thankful to the creators and
maintainers. I look forward to more fun with clojure in the future.

[4clojure]: http://www.4clojure.com/
[devm33]: http://www.4clojure.com/user/devm33
[users]: http://www.4clojure.com/users
[github]: https://github.com/devm33/4clojure_problems
[mapcat]: https://clojuredocs.org/clojure.core/mapcat
[dfa]: http://en.wikipedia.org/wiki/Deterministic_finite_automaton
[140]: http://www.4clojure.com/problem/140
[152]: http://www.4clojure.com/problem/152
[127]: http://www.4clojure.com/problem/127
[pcl]: http://www.4clojure.com/user/_pcl
