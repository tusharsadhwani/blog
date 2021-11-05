---
title: "Understand Python's ASTs, by building your own linter"
description: "The only resource you need to read to learn about ASTs in Python, and the superpowers they give you."
publishDate: "Thursday, 4 November 2000"
author: "Tushar Sadhwani"
heroImage: "/images/ast.jpg"
alt: "Understand Python's ASTs, by building your own linter"
layout: "../../layouts/BlogPost.astro"
---

> This is currently a work in progress.

<!-- Remember to add a twitter mention here :") -->

## So what is an AST?

All your code is a tree of data.

## Why is it important?

## The `ast` module

### All the `Node`s

### What's a `ctx`?

### AST utilities

## The power of AST manipulation

Some really bizarre examples of modifying your code's runtime behaviour go here.

## Let's build: A simple linter

ASTs let you examine code patterns as well, they're really nice.

## What about code formatters?

You need whitespace info, comments and other details that ASTs drop, like what
kind of quotes did you use, single or double. for that for most cases.
Which means you need a CST.

Differentiate between the two, and point towards libcst.

## Where can I learn more?

Read the docs, ast, libcst and and greentreesnakes.
