---
title: "Learn Python ASTs, by building your own linter"
description: "The only resource you need to read to learn about ASTs in Python, and the superpowers they give you."
publishDate: "Thursday, 4 November 2000"
author: "Tushar Sadhwani"
heroImage: "/images/ast.jpg"
alt: "Learn Python ASTs, by building your own linter"
layout: "../../layouts/BlogPost.astro"
---

> This is currently a work in progress.

<!-- Remember to add a twitter mention here :") -->

## So what is an AST?

In programmer terms, "ASTs are a programmatic way to understand the structure of your source code". But to understand what that really means, we must first understand a few things about the structure of a computer program.

The programs that you and I write in our language of choice is usually called the "source code", and I'll be referring to it as such in this article.

On the other end, computer chips can only understand "machine code", which is a set of binary numbers that have special meanings for that model of the chip. Some of these numbers in this "machine code" are instructions, which tell the CPU a simple task to perform, like "add the numbers stored in these two places", or "jump 10 numbers down and continue running code from there". The instructions in machine code are run one by one, and they dictate the flow of the program.

And similarly, in all the languages that I know of, you define your programs as a set of "statements", with each statement being an analogue to the instructions in the machine code. These statements also run one-by-one, and define the behaviour of your software.

I know that the theory is hard to understand if you've never heard of these terms before, so I'm going to go through a bunch of examples. So let's write the same code in many languages:

- Python

  ```python
  def area_of_circle(radius):
      pi = 3.14
      return pi * radius * radius

  area_of_circle(5)
  # Output: 78.5
  ```

- Scheme Lisp

  ```lisp
  (define (area_of_circle radius)
    (define pi 3.14)
    (* pi radius radius))

  (area_of_circle 5)
  ; Output: 78.5
  ```

- C

  ```c
  #include <stdio.h>

  float area_of_circle(float radius) {
    float pi = 3.14;
    return pi * radius * radius;
  }

  int main() {
    printf("%f", area_of_circle(5));
  }
  // Output: 78.500000
  ```

- Go

  ```go
  package main

  func area_of_circle(radius float64) float64 {
    pi := 3.14
    return pi * radius * radius
  }

  func main() {
    println(area_of_circle(5))
  }
  // Output: +7.850000e+001
  ```

We're doing essentially the same thing in all of these, and I'll break it down piece by piece:

- We're defining our source code as a block of statements. In our case, there are two statements at the top-level of our source code: one statement that defines our `area_of_circle` function, and another statement that runs this function with the value "5".

  > In some languages like C and Go, you need to define the `main` function as the entry-point of the program. In those cases, this second statement is inside the main function.

- The definition of the `area_of_circle` function has two parts: the input parameters (the radius, in our case), and the body, which itself is a block of statements. There's two statements inside `area_of_circle` to be specific: the first one defines `pi`, and the second one uses it to calculate the area, and returns it.

- For the languages that have a main funciton, the definition of the main function itself is a statement. Inside that statement we are writing more statements, like one that prints out the value of `area_of_circle` called with the radius of 5.

You can start to see the somewhat repetitive nature of source code. There's blocks of statements, and sometimes within those statements there can be more statements, and so on. If you imagine each statement to be a "node", then you can think of each of these nodes being composed of one or more other "nodes". You can properly define this kind of structure as a "tree":

```text
                 (program)
                /          \\
  (area_of_circle r)       (main)
  /           |               |
define    calculate        run area_of_circle
  pi        area             with r = "5"
           /   |
     multiply  (pi, r, r)
```

The nodes here can be anything, from statements, to expressions, to any other construct that the language defines. Once the code is in this tree structure, computers can start to make sense of it, such as traversing its nodes one by one and generate the appropriate machine code.

Essentially, all your code represents a tree of data. And that tree is called the **Abstract Syntax Tree**. Each programming language has its own AST representation, but the idea is always the same.

And to be able to create tools that do things like auto-format your code, or find subtle bugs automatically, you need ASTs to be able to meaningfully read through find items or patterns inside the code and act on it.

## The `ast` module

Python has a builtin `ast` module, which has a rich set of features to create, modify and run ASTs from Python code. Not all languages provide easy access to their syntax trees, so Python is already pretty good in that regard. Let's take a look at what all the `ast` module gives us, and try to do something interesting with it:

### All the `Node`s

- what's a node, what does it have?
  A Python AST looks like this:

  ```python
  Module(
    body=[
      Statement(
        ...
      )
    ]
  )
  ```

- types of nodes: statements, expressions, operators, are there more?
- More examples of source codes and their corresponding ASTs.

~~ somewhere in here, the idea of visitors is to be explained.

### What's a `ctx`?

~~ Explain how everything that has a value (variables, attributes, indices, slices, etc.) can either be used to access its value or to store a new value in it.

## The power of AST manipulation

Some really bizarre examples of modifying your code's runtime behaviour go here.

~~ explain transformers here?

### AST utilities

~~ fix missing locations, literal eval, parse/unparse, and walk

## Let's build: A simple linter

ASTs let you examine code patterns as well, they're really nice.

## What about code formatters?

You need whitespace info, comments and other details that ASTs drop, like what
kind of quotes did you use, single or double. for that for most cases.
Which means you need a CST.

Differentiate between the two, and point towards libcst.

## Where can I learn more?

Read the docs, ast, libcst and and greentreesnakes.
