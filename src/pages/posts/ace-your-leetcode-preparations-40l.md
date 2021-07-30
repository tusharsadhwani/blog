---
title: "Ace your leetcode preparations"
description: "This is a test."
publishDate: "Tuesday, July 30 2021"
author: "Tushar"
heroImage: "/social.jpg"
alt: "Test"
layout: "../../layouts/BlogPost.astro"
---

I've been practicing my Data Structures and Algorithms on LeetCode for a few months now, and it's an awesome platform. The quality of the questions is generally great, there's very nice explanations for most of the solutions, and there's a very motivated and active community around all of it. Overall, **LeetCode is a great platform.**

BUT, I had two slight problems with it:

1. I personally never understood the idea of writing your code and testing it on a web editor. I mean, I have my own programming environment tailored to exactly how I like to write and test my code. And yes, granted that I'll have to use a google doc or something for my interviews, but I still prefer to have control over how I practice.

2. I'd like to keep and test my solutions locally, in a version-controlled manner, so that I can come back to them later, search through them easily, make changes over time, and to just make sure I never lose my code.

So for this, I created my own LeetCode workflow and local testing library:

## [python-leetcode-runner](https://github.com/tusharsadhwani/python_leetcode_runner)

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jc0e155cb0c46j4vs736.png)

And it has made me many times more productive in solving leetcode problems.

## An example workflow

- I start with opening my github repo where I store all of my leetcode problems: ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0ekjb1stgjvd4u5thl3i.png)

- Then I head over to any leetcode problem page (example: [Plus One](https://leetcode.com/problems/plus-one/)). I copy the problem title and format it to be used as my file name (I specifically created the [snekify](https://github.com/tusharsadhwani/snekify) cli tool for that), and then copy over the Solution code snippet.
![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g7xrybu53nwgqgpyicwi.png)
<figcaption>This creates the filename I want.</figcaption> 
![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ppcrdakrnpoq4aojeovj.png) <figcaption>I also use static type checking, but feel free to remove that!</figcaption>
- Then I copy over the given example test cases into a variable called `tests`:
  ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qm7pahnnorj770nzctfu.png) ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/582b21d0z9a54p4faare.png)
- Then it's time to write a solution and test it using the `pyleet` command given by my testing library: ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0z3g5tsc73x5fzrxb9at.png) ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ys4g5eg77ib2thkfc33d.png)
- Uh oh. Looks like I missed an edge case. Let's fix the code: ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g1thm3azff0w7cnsherp.png) ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ovyi625a9wyf9f43189n.png)

And now all tests pass. Now you can copy your code file (yes, with the `tests` and all) straight into leetcode's editor and submit it. No more silly "Wrong Answers".

## Advanced use cases

Another example: [Linked List cycle](https://leetcode.com/problems/linked-list-cycle/)

Now this has an issue: We need to transform the given input into the linked list data structure, before running our solution.

In other questions for example, you don't just have to match expected output with function output. Like sometimes it might ask you to modify a list in-place, or some might have answers where the order of the output doesn't matter, etc.

For that case, you can provide your own **custom validator function**.

A `validator` is a function that receives 3 arguments:

- `method`: your leetcode solution function
- `inputs`: your test inputs tuple
- `expected`: your expected test output value

## Validator solution example

- Head to [the question](https://leetcode.com/problems/linked-list-cycle/).
- Copy the problem title, format it, and paste the sample code and examples.
  ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0q77wea4f4f293gcdg2q.png) ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ozbqxvspqwhjsuc7x4gw.png)
- Now to be able to run the tests locally, we need to write our own code to convert the array into a linked list: ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cs5i3k298is70mq30b3z.png)
- Now we can solve the question: ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hmhyiymwdgvo9xxl5irx.png)
- Running the tests: ![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vm0wg2di5w4thu882y47.png)

And sure enough, we passed all the test cases. Now simply copy the entire code over to leetcode, and:

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/znhwcxolq6ctgh53f0f1.png)

You can find the complete solution [here](https://github.com/tusharsadhwani/leetcode/blob/master/linked_list_cycle_alt.py).

## Extra tips

- I use [mypy](https://mypy-lang.org) to run static type checking on my code, which ensures stuff like **no runtime Null Pointer Exceptions**.
- I've created a bunch of **code snippets** that auto-fill the test cases, the validator function, and the assert statements. These snippets can be used in VSCode as of now. More info on the [github page](https://github.com/tusharsadhwani/python_leetcode_runner).
- My solutions to all of the problems are stored in this [github repository](https://github.com/tusharsadhwani/leetcode).

## Footnotes

Currently this package only works with Python solutions. But if required, it can be extended to use any language at all. If you're interested in working on other language support, do let me know.

Thanks for reading, I hope this helps you be more productive. :sparkles:
