---
title: "What exactly is a `__pycache__`?"
description: "TODO"
publishDate: "Monday, 1 January 2000"
author: "Tushar Sadhwani"
heroImage: "/images/pyc.jpg"
alt: "What exactly is a __pycache__?"
layout: "../../layouts/BlogPost.astro"
---

While working on a Python project you may have noticed these folders that show up sometimes, named `__pycache__`.

To see how they show up, let's take a project I was working on recently: `interpreted`.

If you were to [clone the project](https://github.com/tusharsadhwani/interpreted), you'd get this project structure:

```text
.
├── src
│   └── interpreted
│       ├── __init__.py
│       ├── __main__.py
│       ├── cli.py
│       ├── interpreter.py
│       ├── nodes.py
│       ├── parser.py
│       ├── py.typed
│       └── tokenizer.py
├── tests
│   └── [...]
├── LICENSE
├── README.md
├── setup.cfg
├── setup.py
└── tox.ini
```

<figcaption>
The `tests` folder has been truncated for brevity.
</figcaption>

All the package's source code is present in the `src/interpreted` directory. The directory contains many python files: `__init__.py`, `cli.py`, `parser.py` and so on.

Now, if you were to start working on the project, by installing it and running tests:

```bash
# create a virtual environment before this
pip install .
pytest
```

`pytest` would run all the tests, and they will likely pass.

But, if you were to look at your directory structure again, it would look like this:

```text
.
├── src
│   └── interpreted
│       ├── __init__.py
│       ├── __main__.py
│       ├── __pycache__
│       │   ├── __init__.cpython-311.pyc
│       │   ├── __main__.cpython-311.pyc
│       │   ├── cli.cpython-311.pyc
│       │   ├── interpreter.cpython-311.pyc
│       │   ├── nodes.cpython-311.pyc
│       │   ├── parser.cpython-311.pyc
│       │   └── tokenizer.cpython-311.pyc
│       ├── cli.py
│       ├── interpreter.py
│       ├── nodes.py
│       ├── parser.py
│       ├── py.typed
│       └── tokenizer.py
├── tests
│   └── [...]
├── LICENSE
├── README.md
├── setup.cfg
├── setup.py
└── tox.ini
```

Notice the new `__pycache__` folder. Can you spot the correlation?

Indeed, for every `.py` folder inside `src/interpreted`, there is a `.python-311.pyc` file in the `__pycache__` folder.

For some spoilers, yeah this is indeed a cache, created for each of these Python files. But what kind of cache, exactly?

## `pyc` files: the what and the why

<!-- So they exist because python has to be compiled to bytecode before it runs, and by caching the compiled bytecode of the files that don't change very often you decrease startup time. Demonstrate this? -->

## sidetrack: Python is compiled?

<!-- Yeah. Why? because bytecode VMs are faster, almost every interpreted langauge compiles to bytecode. Even java. Show bytecode. -->

## Creating a pyc file

<!-- Basically, import a file from another. Now you have a pyc file. But also do it manually. -->
<!-- This is exactly why the cache showed up when we ran tests, because running tests imports the project files, which triggers cache creation. -->
<!-- By manually i mean, _really_ manually. Like create a module from nothing. -->

## Running a pyc file

<!-- Well, do nothing. Python will verify timestamp/hash, and run the pyc file for you. But how do you know for sure?: Verify it with a flag  Also how can I run it manually? -->

## Appendix: hash based cache checking?
