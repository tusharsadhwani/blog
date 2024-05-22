---
title: "Replacing pyinstaller with 100 lines of code"
description: "A tale of how I accidentally stumbled upon some interesting tech over time."
publishDate: "Wednesday, 22 May 2024"
author: "Tushar Sadhwani"
heroImage: "/images/packaged.png"
alt: "Replacing pyinstaller with 100 lines of code"
layout: "../../layouts/BlogPost.astro"
---

## Prelude

A year or so ago, I stumbled upon this repository called [python-build-standalone][1].
And this was a _\*ridiculous\*_ thing to stumble upon.

This repository essentially contains **portable Pythons**. Python interpreters
that can be unzipped into any folder, and they just work.

This immediately sparked some weird ideas in my head. I also found a way to
use this package at work!

But first of all, I decided to build [yen][2].

## The first puzzle piece: `yen`

`yen` was my idea of a `pyenv` replacement. While also being incredibly simple.

What `pyenv` promises is being able to install any version of Python on any
machine. Well, so long as that machine has the dependencies to build Python. And
that's the big problem with `pyenv`: it kinda sucks.

Not only does it build Python from source on your machine, so it's not as
straightforward as one would think... it also is notorious for the compiled
Pythons being different from the official releases in slight ways.

`yen` on the other hand, simply downloads one of these pre-built Pythons, throws
it in the `~/.yen_pythons` folder in your home directory, and voila. You now
have Python on your machine.

```console
$ yen list
Available Pythons:
3.12.3
3.11.9
3.10.14
3.9.19
3.8.19

$ yen create -p3.12 venv3
Created venv3 with Python 3.12.3 ✨
```

`yen` also supports windows! 2 for `yen`, 0 for `pyenv`.

I happily replaced `pyenv` with `yen` in my life and moved along.

> I should note that the `rye` package manager's abilities to download Python is
> essentially backed by the same technology. However `rye` can do a lot more.

## The second puzzle piece: `makeself`

Then a few weeks ago, I found [makeself][3].

`makeself` is a tool that can create [self-extracting archives][4]. This
basically means that instead of creating a zipfile that you have to extract and
then find what item to run inside it, `makeself` will embed the zipfile inside
a bash script, that will _*extract itself*_ and then run the command to run the
extracted file.

It's a beautiful piece of tech, and it works flawlessly. And as soon as I
learned about it, I knew what I had to do: **self-contained Python programs**.

## The finale: `packaged`

So `packaged` literally just does this:

- Use `yen` to download a specific Python version inside your project directory,
- Install your project inside the downloaded Python, with a command that you
  provide,
- And package up the whole project with `makeself` to create a self-extracting
  executable, alongside your startup command that also points to the packaged
  Python version.

In essence, it's just a zipfile of your project with a Python interpreter that
extracts and runs itself.

You can package your project into a single file with something as simple as:

```bash
packaged ./myapp 'pip install -r requirements.txt' 'python myapp.py'
```

It started as [100 lines of code][5]. And it works _so well_.

**Check the demo website: [packaged.live](https://packaged.live).**

It contains GUI applications with various C and Python dependencies, TUI apps,
CLI apps, you name it. All packaged as a standalone executable, for MacOS and
Linux, supporting 64-bit x86 and ARM.

> I know, I know. I'm working on Windows support.

Is this the whole project? Maybe. Unless you find use it, and you find bugs. And
I'm sure you'll find bugs. I found a couple myself!

So try out `packaged`, and stop worrying about how to ship this Python app
to your users.

## Special mention: `PyOxidizer`

I did find out eventually that PyOxidizer is essentially a much more capable
version of what I've built, while it's not as straightforward as one command,
but it lets you have a lot more complicated build setups, you can embed Rust
code in your built executable, and a lot more.

So if your usecase calls for it, you can pull out [PyOxidizer][6] as your
preferred packaging tool as well.

## What else

If you've read my blogs before, I swear I haven't stopped writing blogs. I have
at least 3 articles that I started and never finished in the past 2 years. Some
of them are basically complete. So there is a decent chance that you might find
one soon. So, subscribe to the newsletter!

Oh, and if you want to talk, I'm most easily reachable on [twitter][twitter].

[1]: https://github.com/indygreg/python-build-standalone
[2]: https://github.com/tusharsadhwani/yen
[3]: https://github.com/megastep/makeself
[4]: https://en.wikipedia.org/wiki/Self-extracting_archive
[5]: https://github.com/tusharsadhwani/packaged/blob/0620d67/src/packaged/__init__.py
[6]: https://github.com/indygreg/PyOxidizer
[twitter]: https://twitter.com/tusharisanerd
