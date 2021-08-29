---
title: "A tour of Python, through its builtins"
description: "Python has a whole lot of builtins that are unknown to most people. This guide aims to introduce you to everything that Python has to offer, through its seemingly obscute builtins."
publishDate: "Wednesday, 18 August 2021"
author: "Tushar Sadhwani"
heroImage: "/images/builtins.jpg"
alt: "A tour of Python, through its builtins"
layout: "../../layouts/BlogPost.astro"
---

Python as a language is comparatively simple. And I believe, that you can learn quite a bit about Python and its features, just by learning what all of its builtins are, and what they do. And to back up that claim, I'll be doing just that.

## So what's a builtin?

A builtin in a Python is everything that lives in the `builtins` module.

To understand this better, you'll need to learn about the **L.E.G.B.** rule.

^ This defines the order of scopes in which variables are looked up in Python. It stands for:

- **L**ocal scope
- **E**nclosing (or nonlocal) scope
- **G**lobal scope
- **B**uiltin scope

### Local scope

The local scope refers to the scope that comes with the current function or class you are in. Every function call and class instantiation creates a fresh local scope for you, to hold local variables in.

Here's an example:

```python
x = 11
print(x)

def some_function():
    x = 22
    print(x)

some_function()

print(x)
```

Running this code outputs:

```plaintext
11
22
11
```

So here's what's happening: Doing `x = 22` defines a new variable inside `some_function` is in it's own **local namespace**. After that point, when the function refers to `x` it means the one in its own scope. Accessing `x` outside of `some_function` refers to the one defined outside.

### Enclosing scope

The enclosing scope (or nonlocal scope) refers to the scope of the classes or functions inside which the current function/class lives.

... I can already see half of you going 🤨 right now. So let me explain with an example:

```python
x = 11
def outer_function():
    x = 22
    y = 789

    def inner_function():
        x = 33
        print('Inner x:', x)
        print('Enclosing y:', y)

    inner_function()
    print('Outer x:', x)

outer_function()
print('Global x:', x)
```

The output of this is:

```plaintext
Inner x: 33
Enclosing y: 789
Outer x: 22
Global x: 11
```

What it essentially means is that every new function/class creates its own local scope, **separate from its outer environment**. Trying to access an outer variable will work, but any variable created in the local scope does not affect the outer scope.

> But what if I want to affect the outer scope?

To do that, you can use the `nonlocal` keyword in Python to tell the interpreter that you don't mean to define a new variable in the local scope, but you want to modify the one in the enclosing scope.

```python
def outer_function():
    x = 11

    def inner_function():
        nonlocal x
        x = 22
        print('Inner x:', x)

    inner_funcion()
    print('Outer x:', x)
```

This prints:

```plaintext
Inner x: 22
Outer x: 22
```

### Global scope

Global scope (or module scope) simply refers to the scope where all the module's variables, functions and classes are defined.

A "module" is any python file or package that can be run or imported. For eg. `time` is a module (as you can do `import time` in your code), and `time.sleep()` is a function defined in the `time` module's global scope.

Every module in Python has a few pre-defined globals, such as `__name__` and `__doc__`, which refer to the module's name and the module's docstring, respectively. You can try this in the REPL:

```python
>>> print(__name__)
__main__
>>> print(__doc__)
None
>>> import time
>>> time.__name__
'time'
>>> time.__doc__
'This module provides various functions to manipulate time values.'
```

### Builtin scope

Now we get to the topic of this blog &mdash; the builtin scope.

So there's two things to know about the builtin scope in Python:

- It's the scope where essentially all of Python's top level functions are defined, such as `len`, `range` and `print`.
- When a variable is not found in the local, enclosing or global scope, Python looks for it inside the builtins.

You can inspect the builtins directly if you want, by importing the `builtins` module, and checking methods inside it:

```python
>>> import builtins
>>> builtins.a
builtins.abs(    builtins.all(    builtins.any(    builtins.ascii(
```

And for some reason unknown to me, Python exposes the builtins module as `__builtins__` by default in the global namespace. So you can also access `__builtins__` directly, without importing anything.

## _ALL_ the builtins

You can use the `dir` function to print all the variables defined inside a module or class. So let's use that to list out all of the builtins:

```python
>>> print(dir(__builtins__))
['ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException', 'BlockingIOError', 'BrokenPipeError', 'BufferError', 'BytesWarning', 'ChildProcessError', 'ConnectionAbortedError', 'ConnectionError', 'ConnectionRefusedError', 'ConnectionResetError', 'DeprecationWarning', 'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception', 'False', 'FileExistsError', 'FileNotFoundError', 'FloatingPointError', 'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError', 'ImportWarning', 'IndentationError', 'IndexError', 'InterruptedError', 'IsADirectoryError', 'KeyError', 'KeyboardInterrupt', 'LookupError', 'MemoryError', 'ModuleNotFoundError', 'NameError', 'None', 'NotADirectoryError', 'NotImplemented', 'NotImplementedError', 'OSError', 'OverflowError', 'PendingDeprecationWarning', 'PermissionError', 'ProcessLookupError', 'RecursionError', 'ReferenceError', 'ResourceWarning', 'RuntimeError', 'RuntimeWarning', 'StopAsyncIteration', 'StopIteration', 'SyntaxError', 'SyntaxWarning', 'SystemError', 'SystemExit', 'TabError', 'TimeoutError', 'True', 'TypeError', 'UnboundLocalError', 'UnicodeDecodeError', 'UnicodeEncodeError', 'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning', 'ValueError', 'Warning', 'ZeroDivisionError', '__build_class__', '__debug__', '__doc__', '__import__', '__loader__', '__name__', '__package__', '__spec__', 'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'copyright', 'credits', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'exit', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip']
```

- Interesting ones like `format`, `sorted`, `any` and `vars`
- Interacting with `locals` and `globals`
- Descriptors: `property`, `staticmethod`, etc.
- Truly dynamic: `eval` and `exec`
- Interesting data types: `frozenset`, `complex`, `memoryview`, etc.
- `iter` and `next`
- `code` type and the `compile` function
- `print(dir(__builtins__))`

## Where to learn more?

Through python's docs :D
