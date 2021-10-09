---
title: "Understanding all of Python, through its builtins"
description: "Python has a whole lot of builtins that are unknown to most people. This guide aims to introduce you to everything that Python has to offer, through its seemingly obscure builtins."
publishDate: "Wednesday, 18 August 2001"
author: "Tushar Sadhwani"
heroImage: "/images/builtins.jpg"
alt: "Understanding all of Python, through its builtins"
layout: "../../layouts/BlogPost.astro"
# TODO: convert the \\n back to \n once astro fixes it
---

> ### This blog is currently a work in progress.

Python as a language is comparatively simple. And I believe, that you can learn quite a lot about Python and its features, just by learning what all of its builtins are, and what they do. And to back up that claim, I'll be doing just that.

> Just to be clear, this is not going to be a tutorial post. Covering such a vast amount of material in a single blog post, while starting from the beginning is pretty much impossible. So I'll be assuming you have a basic to intermediate understanding of Python. But other than that, we should be good to go.

## Index

- [Index](#index)
- [So what's a builtin?](#so-whats-a-builtin)
  - [Local scope](#local-scope)
  - [Enclosing scope](#enclosing-scope)
  - [Global scope](#global-scope)
  - [Builtin scope](#builtin-scope)
- [_ALL_ the builtins](#all-the-builtins)
- [Exceptions](#exceptions)
- [Constants](#constants)
- [Funky globals](#funky-globals)
  - [`__name__`](#__name__)
  - [`__doc__`](#__doc__)
  - [`__package__`](#__package__)
  - [`__spec__`](#__spec__)
  - [`__loader__`](#__loader__)
  - [`__import__`](#__import__)
  - [`__debug__`](#__debug__)
  - [`__build_class__`](#__build_class__)
  - [`__cached__`](#__cached__)
- [All the builtins, one by one](#all-the-builtins-one-by-one)
  - [`compile`, `exec` and `eval`](#compile-exec-and-eval)
  - [`input` and `print`: The bread and butter](#input-and-print-the-bread-and-butter)
  - [`str`, `bytes`, `int`, `bool`, `float` and `complex`: The five primitives](#str-bytes-int-bool-float-and-complex-the-five-primitives)
  - [`object`](#object)
  - [`type`](#type)
  - [`list`, `tuple`, `dict`, `set` and `frozenset`: The containers](#list-tuple-dict-set-and-frozenset-the-containers)
  - [`hash` and `id`: The equality fundamentals](#hash-and-id-the-equality-fundamentals)
  - [`bytearray` and `memoryview`: Better byte interfaces](#bytearray-and-memoryview-better-byte-interfaces)
  - [`dir` and `vars`: Everything is a dictionary](#dir-and-vars-everything-is-a-dictionary)
  - [`hasattr`, `getattr`, `setattr` and `delattr`: Attribute helpers](#hasattr-getattr-setattr-and-delattr-attribute-helpers)
  - [`bin`, `hex`, `oct`, `ord`, `chr` and `ascii`: Basic conversions](#bin-hex-oct-ord-chr-and-ascii-basic-conversions)
  - [`format`](#format)
  - [`any` and `all`](#any-and-all)
  - [`abs`, `divmod`, `pow` and `round`: Math basics](#abs-divmod-pow-and-round-math-basics)
  - [`isinstance` and `issubclass`: Runtime type checking](#isinstance-and-issubclass-runtime-type-checking)
  - [`callable` and duck typing basics](#callable-and-duck-typing-basics)
  - [`property`, `classmethod`, `staticmethod`](#property-classmethod-staticmethod)
  - [`super`](#super)
  - [`sorted` and `reversed`: Sequence manipulators](#sorted-and-reversed-sequence-manipulators)
  - [`map` and `filter`: Functional primitives](#map-and-filter-functional-primitives)
  - [`len`, `max`, `min` and `sum`: Aggregate functions](#len-max-min-and-sum-aggregate-functions)
  - [`iter`, `next`](#iter-next)
  - [`range`, `enumerate`, `zip`](#range-enumerate-zip)
  - [`slice`](#slice)
  - [`globals`, `locals`](#globals-locals)
  - [`breakpoint`: built-in debugging](#breakpoint-built-in-debugging)
  - [`repr`](#repr)
  - [`open`](#open)
  - [`help`, `exit`, `quit`](#help-exit-quit)
  - [`copyright`, `credits`, `license`](#copyright-credits-license)
- [So what's next?](#so-whats-next)
- [The end](#the-end)

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

Now we get to the topic of this blog -- the builtin scope.

So there's two things to know about the builtin scope in Python:

- It's the scope where essentially all of Python's top level functions are defined, such as `len`, `range` and `print`.
- When a variable is not found in the local, enclosing or global scope, Python looks for it inside the builtins.

You can inspect the builtins directly if you want, by importing the `builtins` module, and checking methods inside it:

```python
>>> import builtins
>>> builtins.a   # press <Tab> here
builtins.abs(    builtins.all(    builtins.any(    builtins.ascii(
```

And for some reason unknown to me, Python exposes the builtins module as `__builtins__` by default in the global namespace. So you can also access `__builtins__` directly, without importing anything. Note, that `__builtins__` being available is a CPython implementation detail, and other Python implementations might not have it. `import builtins` is the most correct way to access the builtins module.

## _ALL_ the builtins

You can use the `dir` function to print all the variables defined inside a module or class. So let's use that to list out all of the builtins:

```python
>>> print(dir(__builtins__))
['ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException',
 'BlockingIOError', 'BrokenPipeError', 'BufferError', 'BytesWarning',
 'ChildProcessError', 'ConnectionAbortedError', 'ConnectionError',
 'ConnectionRefusedError', 'ConnectionResetError', 'DeprecationWarning',
 'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception', 'False',
 'FileExistsError', 'FileNotFoundError', 'FloatingPointError',
 'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError',
 'ImportWarning', 'IndentationError', 'IndexError', 'InterruptedError',
 'IsADirectoryError', 'KeyError', 'KeyboardInterrupt', 'LookupError',
 'MemoryError', 'ModuleNotFoundError', 'NameError', 'None',
 'NotADirectoryError', 'NotImplemented', 'NotImplementedError',
 'OSError', 'OverflowError', 'PendingDeprecationWarning',
 'PermissionError', 'ProcessLookupError', 'RecursionError',
 'ReferenceError', 'ResourceWarning', 'RuntimeError', 'RuntimeWarning',
 'StopAsyncIteration', 'StopIteration', 'SyntaxError', 'SyntaxWarning',
 'SystemError', 'SystemExit', 'TabError', 'TimeoutError', 'True',
 'TypeError', 'UnboundLocalError', 'UnicodeDecodeError',
 'UnicodeEncodeError', 'UnicodeError', 'UnicodeTranslateError',
 'UnicodeWarning', 'UserWarning', 'ValueError', 'Warning',
 'ZeroDivisionError', '__build_class__', '__debug__', '__doc__',
 '__import__', '__loader__', '__name__', '__package__', '__spec__',
 'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray',
 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex',
 'copyright', 'credits', 'delattr', 'dict', 'dir', 'divmod', 'enumerate',
 'eval', 'exec', 'exit', 'filter', 'float', 'format', 'frozenset',
 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input',
 'int', 'isinstance', 'issubclass', 'iter', 'len', 'license', 'list',
 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct',
 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr',
 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted',
 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip']
```

...yeah, there's a lot. But don't worry, we'll break these down into various groups, and knock them down one by one.

So let's tackle the biggest group by far:

## Exceptions

Python has 66 built-in exception classes, each one intended to be used by the user, the standard library and everyone else, to serve as meaningful ways to interpret and catch errors in your code.

To explain exactly why there's separate Exception classes in Python, here's a quick example:

```python
def fetch_from_cache(key):
    if key is None:
        raise ValueError('key must not be None')

    return cached_items[key]

def get_value(key):
    try:
        value = fetch_from_cache(key)
    except KeyError:
        value = fetch_from_api(key)

    return value
```

Focus on the `get_value` function. It's supposed to return a cached value if it exists, otherwise fetch data from an API.

There's 3 things that can happen in that function:

- If the `key` is not in the cache, trying to access `cached_items[key]` raises a `KeyError`. This is caught in the `try` block, and an API call is made to get the data.
- If they `key` _is_ present in the cache, it is returned as is.
- There's also a third case, where `key` is `None`.

  If the key is `None`, `fetch_from_cache` raises a `ValueError`, indicating that the value provided to this function was inappropriate. And since the `try` block only catches `KeyError`, this error is shown directly to the user.

  ```python
  >>> x = None
  >>> get_value(x)
  Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    File "<stdin>", line 3, in get_value
    File "<stdin>", line 3, in fetch_from_cache
  ValueError: key must not be None
  >>>
  ```

If `ValueError` and `KeyError` weren't predefined, meaningful error types, there wouldn't be any way to differentiate between error types in this way.

<details>
<summary>P.S. Some extra Exception trivia...</summary>

A fun fact about exceptions is that they can be sub-classed to make your own, more specific error types. For example, you can create a `InvalidEmailError` extending `ValueError`, to raise errors when you expected to receive an E-mail string, but it wasn't valid. If you do this, you'll be able to catch `InvalidEmailError` by doing `except ValueError` as well.

Another fact about exceptions is that every exception is a subclasses of `BaseException`, and nearly all of them are subclasses of `Exception`, other than a few that aren't supposed to be normally caught. So if you ever wanted to be able to catch any exception normally thrown by code, you could do

```python
except Exception: ...
```

and if you wanted to catch _every possible error_, you could do

```python
except BaseException: ...
```

Doing that would even catch `KeyboardInterrupt`, which would make you unable to close your program by pressing `Ctrl+C`. To read about the hierarchy of which Error is subclassed from which in Python, you can check the [Exception hierarchy](https://docs.python.org/3/library/exceptions.html#exception-hierarchy) in the docs.

</details>

Now I should point it out that now _all_ uppercase values in that output above were exception types, there's in-fact, 1 another type of built-in objects in Python that are uppercase: constants. So let's talk about those.

## Constants

There's exactly 5 constants: `True`, `False`, `None`, `Ellipsis`, and `NotImplemented`.

`True` `False` and `None` are the most obvious constants.

`Ellipsis` is an interesting one, and it's actually represented in two forms: the word `Ellipsis`, and the symbol `...`. It mostly exists to support [type annotations](/mypy-guide), and for some very fancy slicing support.

`NotImplemented` is the most interesting of them all _(other than the fact that `True` and `False` actually function as `1` and `0` if you didn't know that, but I digress)_. `NotImplemented` is used inside a class' operator definitions, when you want to tell Python that a certain operator isn't defined for this class.

Now I should mention that all objects in Python can add support for all Python operators, such as `+`, `-`, `+=`, etc., by defining special methods inside their class, such as `__add__` for `+`, `__iadd__` for `+=`, and so on.

Let's see a quick example of that:

```python
class MyNumber:
    def __add__(self, other):
        return other + 42
```

<details>
<summary>Extras: right-operators</summary>

If you're wondering from the code example above why I never tried to do `3 + n`, it's because it doesn't work yet:

```python
>>> 100 + n
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: unsupported operand type(s) for +: 'int' and 'MyNumber'
```

But, support for that can be added pretty easily by adding the `__radd__` operator, which adds support for _right-addition_:

```python
class MyNumber:
    def __add__(self, other):
        return other + 42

    def __radd__(self, other):
        return other + 42
```

As a bonus, this also adds support for adding two `MyNumber` classes:

```python
>>> n = MyNumber()
>>> n + 100
142
>>> 3 + n
45
>>> n + n
84
```

</details>

But let's say you only want to support integer addition with this class, and not floats. This is where you'd use `NotImplemented`:

```python
class MyNumber:
    def __add__(self, other):
        if isinstance(other, float):
            return NotImplemented

        return other + 42
```

Returning `NotImplemented` from an operator method tells Python that this is an unsupported operation. Python then conveniently wraps this into a `TypeError` with a meaningful message:

```python
>>> n + 0.12
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: unsupported operand type(s) for +: 'MyNumber' and 'float'
>>> n + 10
52
```

A weird fact about constants is that they aren't even implemented in Python, they're implemented directly in C code, like [this](https://github.com/python/cpython/blob/7e246a3/Include/object.h#L610) for example.

## Funky globals

There's another group of odd-looking values in the builtins output we saw above: values like `__spec__`, `__loader__`, `__debug__` etc.

These are actually not unique to the `builtins` module. These properties are all present in the global scope of every module in Python, as they are _module attributes_. These hold information about the module that is required for the **import machinery**. Let's take a look at them:

### `__name__`

Contains the name of the module. `builtins.__name__` will be the string `'builtins'`. When you run a Python file, that is also run as a module, and the module name for that is `__main__`. This should explain why `if __name__ == '__main__'` is used in Python files.

### `__doc__`

Contains the module's docstring. It's what's shown as the module description when you do `help(module_name)`.

```python
>>> import time
>>> print(time.__doc__)
This module provides various functions to manipulate time values.

There are two standard representations of time.  One is the number...
>>> help(time)
Help on built-in module time:

NAME
    time - This module provides various functions to manipulate time values.

DESCRIPTION
    There are two standard representations of time.  One is the number...
```

> More Python trivia: this is why the [PEP8 style guide](https://python.org/dev/peps/pep-0008) says "docstrings should have a line length of 72 characters": because docstrings can be indented upto two levels in the `help()` message, so to neatly fit on an 80-character wide terminal they must be at a maximum, 72 characters wide.

### `__package__`

The package to which this module belongs. For top-level modules it is the same as `__name__`. For sub-modules it is the package's `__name__`. For example:

```python
>>> import urllib.request
>>> urllib.__package__
'urllib'
>>> urllib.request.__package__
'urllib'
```

### `__spec__`

This refers to the module spec. It contains metadata such as the module name, what kind of module it is, as well as how it was created and loaded.

```python
$ tree mytest
mytest
└── a
    └── b.py

1 directory, 1 file

$ python -q
>>> import mytest.a.b
>>> mytest.__spec__
ModuleSpec(name='mytest', loader=<_frozen_importlib_external._NamespaceLoader object at 0x7f28c767e5e0>, submodule_search_locations=_NamespacePath(['/tmp/mytest']))
>>> mytest.a.b.__spec__
ModuleSpec(name='mytest.a.b', loader=<_frozen_importlib_external.SourceFileLoader object at 0x7f28c767e430>, origin='/tmp/mytest/a/b.py')
```

You can see through it that, `mytest` was located using something called `NamespaceLoader` from the directory `/tmp/mytest`, and `mytest.a.b` was loaded using a `SourceFileLoader`, from the source file `b.py`.

### `__loader__`

Let's see what this is, directly in the REPL:

```python
>>> __loader__
<class '_frozen_importlib.BuiltinImporter'>
```

The `__loader__` is set to the loader object that the import machinery used when loading the module. This specific one is defined within the `_frozen_importlib` module, and is what's used to import the builtin modules.

Looking slightly more closely at the example before this, you might notice that the `loader` attributes of the module spec are `Loader` classes that come from the slightly different `_frozen_importlib_external` module.

So you might ask, what are these weird `_frozen` modules? Well, my friend, it's exactly as they say -- they're _frozen modules_.

The _actual_ source code of these two modules is actually inside the `importlib.machinery` module. These `_frozen` aliases are frozen versions of the source code of these loaders. To create a frozen module, the Python code is compiled to a code object, marshalled into a file, and then added to the Python executable.

Python freezes these two modules because they implement the core of the import system and, thus, cannot be imported like other Python files when the interpreter boots up. Essentially, they are needed to exist to _bootstrap the import system_.

Funnily enough, there's another well-defined frozen module in Python: it's `__hello__`:

```python
>>> import __hello__
Hello world!
```

Is this the shortest hello world code in any language? :P

Well this `__hello__` module was originally added to Python as a test for frozen modules, to see whether or not they work properly. It has stayed in the language as an easter egg ever since.

### `__import__`

`__import__` is the builtin function that defines how import statements work in Python.

```python
>>> import random
>>> random
<module 'random' from '/usr/lib/python3.9/random.py'>
>>> __import__('random')
<module 'random' from '/usr/lib/python3.9/random.py'>
>>> np = __import__('numpy')  # Same as doing 'import numpy as np'
>>> np
<module 'numpy' from '/home/tushar/.local/lib/python3.9/site-packages/numpy/__init__.py'>
```

Essentially, every import statement can be translated into an `__import__` function call. Internally, that's pretty much what Python is doing to the import statements (but directly in C).

> Now, there's three more of these properties left: `__debug__` and `__build_class__` which are only present globally and are not module variables, and `__cached__`, which is only present in imported modules.

### `__debug__`

This is a global, constant value in Python, which is almost always set to `True`.

What it refers to, is Python running in _debug mode_. And Python always runs in debug mode by default.

The other mode that Python can run in, is _"optimized mode"_. To run python in "optimized mode", you can invoke it by passing the `-O` flag. And all it does, is prevents assert statements from doing anything (at least so far), which is in all honesty, not really useful at all.

```python
$ python
>>> __debug__
True
>>> assert False, 'some error'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AssertionError: some error
>>>

$ python -O
>>> __debug__
False
>>> assert False, 'some error'
>>>
```

Also, `__debug__`, `True` `False` and `None` are the only **true constants** in Python, i.e. these 4 are the only global variables in Python that you cannot overwrite with a new value.

```python
>>> True = 42
  File "<stdin>", line 1
    True = 42
    ^
SyntaxError: cannot assign to True
>>> __debug__ = False
  File "<stdin>", line 1
SyntaxError: cannot assign to __debug__
```

### `__build_class__`

This global was added in Python 3.1, to allow for class definitions to accept arbitrary positional and keyword arguments. There are long, technical reasons to why this is a feature, and it touches advanced topics like metaclasses, so unfortunately I won't be explaining why it exists.

But all you need to know is that this is what allows you to do things like this while making a class:

```python
>>> class C:
...     def __init_subclass__(self, **kwargs):
...         print(f'Subclass got data: {kwargs}')
...
>>> class D(C, num=42, data='xyz'):
...     pass
...
Subclass got data: {'num': 42, 'data': 'xyz'}
>>>
```

Before Python 3.1, The class creation syntax only allowed passing base classes to inherit from, and a metaclass property. The new requirements were to allow variable number of positional and keyword arguments. This would be a bit messy and complex to add to the language.

But, we already have this, of course, in the code for calling regular functions. So it was proposed that the `Class X(...)` syntax will simply delegate to a function call underneath: `__build_class__(cls, ...)`.

### `__cached__`

This is an interesting one.

When you import a module, the `__cached__` property stores the path of the cached file of the **compiled Python bytecode** of that module.

"What?!", you might be saying, "Python? Compiled?"

Yeah. Python _is_ compiled. In fact, all Python code is compiled, but not to machine code -- to **bytecode**. Let me explain this point by explaining how Python runs your code.

Here are the steps that the Python interpreter does to run your code:

- It takes your source file, and parses it into a syntax tree. The syntax tree is a representation of your code that can be more easily understood by a program. It finds and reports any errors in the code's syntax, and ensures that there are no ambiguities.
- The next step is to compile the source file into _bytecode_. This bytecode is a set of micro-instructions for **Python's virtual machine**. This "virtual machine" is where Python's interpreter logic resides. It essentially _emulates_ a very simple stack-based computer on your machine, in order to execute the Python code written by you.
- This bytecode-form of your code is then run on the Python VM. The bytecode instructions are simple things like pushing and popping data off the current stack. Each of these instructions, when run one after the other, executes the entire program.

> We will take a really detailed example of the steps above, in the next section. Hang tight!

Now since the "compiling to bytecode" step above takes a noticeable amount of time when you import a module, Python stores _(marshalls)_ the bytecode into a `.pyc` file, and stores it in a folder called `__pycache__`. The `__cached__` parameter of the imported module then points to this `.pyc` file.

When the same module is imported again at a later time, Python checks if a `.pyc` version of the module exists, and then directly imports the already-compiled version instead, saving a bunch of time and computation.

If you're wondering: yes, you can directly run or import a `.pyc` file in Python code, just like a `.py` file:

```python
>>> import test
>>> test.__cached__
'/usr/lib/python3.9/test/__pycache__/__init__.cpython-39.pyc'
>>> exit()

$ cp '/usr/lib/python3.9/test/__pycache__/__init__.cpython-39.pyc' cached_test.pyc
$ python
>>> import cached_test  # Runs!
>>>
```

## All the builtins, one by one

Now we can finally get on with builtins. And, to build upon the last section, let's start this off with some of the most interesting ones, the ones that build the basis of Python as a language.

### `compile`, `exec` and `eval`

In the previous section, we saw the 3 steps required to run some python code. This section will get into details about the 3 steps, and how you can observe exactly what Python is doing.

Let's take this code as an example:

```python
x = [1, 2]
print(x)
```

You can save this code into a file and run it, or type it in the Python REPL. In both the cases, you'll get an output.

Or thirdly, you can give the program as a string to Python's builtin function `exec`:

```python
>>> code = '''
... x = [1, 2]
... print(x)
... '''
>>> exec(code)
[1, 2]
```

`exec` (short for execute) takes in some Python code as a string, and runs it as Python code. By default, `exec` will run in the same scope as the rest of your code, which means, that it can read and manipulate variables just like any other piece of code in your Python file.

```python
>>> x = 5
>>> exec('print(x)')
5
```

`exec` allows you to run truly dynamic code at runtime. You could, for example, download a Python file from the internet at runtime, pass its content to `exec` and it will run it for you. (But please, never, ever do that.)

For the most part, you don't really need `exec` while writing your code. It's useful for implementing some really dynamic behaviour (such as creating a dynamic class at runtime, like `collections.namedtuple` does), or to modify the code being read from a Python file (like in [zxpy](https://github.com/tusharsadhwani/zxpy/blob/3e4eb5e344601cc5a1b4e4f9f72ac3f30111cc93/zx.py#L304)).

But, that's not the main topic of discussion today. We must learn _how_ `exec` does all of these fancy runtime things.

`exec` can not only take in a string and run it as code, it can also take in a **code object**.

Code objects are the "bytecode" version of Python programs, as discussed before. They contain not only the exact instructions generated from your Python code, but it also stores things like the variables and the constants used inside that piece of code.

Code objects are generated from ASTs (abstract syntax trees), which are themselves generated by a parser that runs on a string of code.

Now, if you're still here after all that nonsense, let's try to learn this by example instead. We'll first generate an AST from our code using the `ast` module:

```python
>>> import ast
>>> code = '''
... x = [1, 2]
... print(x)
... '''
>>> tree = ast.parse(code)
>>> print(ast.dump(tree, indent=2))
Module(
  body=[
    Assign(
      targets=[
        Name(id='x', ctx=Store())],
      value=List(
        elts=[
          Constant(value=1),
          Constant(value=2)],
        ctx=Load())),
    Expr(
      value=Call(
        func=Name(id='print', ctx=Load()),
        args=[
          Name(id='x', ctx=Load())],
        keywords=[]))],
  type_ignores=[])
```

It might seem a bit too much at first, but let me break it down.

The `AST` is taken as a python module (the same as a Python file in this case).

```python
>>> print(ast.dump(tree, indent=2))
Module(
  body=[
    ...
```

The module's body has two children (two statements):

- The first is an `Assign` statement...

  ```python
  Assign(
      ...
  ```

  Which assigns to the target `x`...

  ```python
      targets=[
        Name(id='x', ctx=Store())],
      ...
  ```

  The value of a `list` with 2 constants `1` and `2`.

  ```python
      value=List(
        elts=[
          Constant(value=1),
          Constant(value=2)],
        ctx=Load())),
    ),
  ```

- The second is an `Expr` statement, which in this case is a function call...

  ```python
    Expr(
      value=Call(
        ...
  ```

  Of the name `print`, with the value `x`.

  ```python
      func=Name(id='print', ctx=Load()),
        args=[
          Name(id='x', ctx=Load())],
  ```

Doesn't seem that bad now, right?

<details>
<summary>Extras: the Tokenizer</summary>

There's actually one step that occurs before parsing the code into an AST: **Lexing**.

This refers to converting the source code into tokens, based on Python's _grammar_. You can take a look at how Python tokenizes your files, you can use the `tokenize` module:

```python
$ cat code.py
x = [1, 2]
print(x)

$ py -m tokenize code.py
0,0-0,0:            ENCODING       'utf-8'
1,0-1,1:            NAME           'x'
1,2-1,3:            OP             '='
1,4-1,5:            OP             '['
1,5-1,6:            NUMBER         '1'
1,6-1,7:            OP             ','
1,8-1,9:            NUMBER         '2'
1,9-1,10:           OP             ']'
1,10-1,11:          NEWLINE        '\n'
2,0-2,5:            NAME           'print'
2,5-2,6:            OP             '('
2,6-2,7:            NAME           'x'
2,7-2,8:            OP             ')'
2,8-2,9:            NEWLINE        '\n'
3,0-3,0:            ENDMARKER      ''
```

It has converted our file into its bare tokens, things like variable names, brackets, strings and numbers. It also keeps track of the line numbers and locations of each token, which helps in pointing at the exact location of an error message, for example.

This "token stream" is what's parsed into an AST.

</details>

So now we have an AST object. We can _compile_ it into a code object using `compile`. Running `exec` on the code object will do the same thing:

```python
>>> import ast
>>> code = '''
... x = [1, 2]
... print(x)
... '''
>>> tree = ast.parse(code)
>>> code_obj = compile(tree, 'myfile.py', 'exec')
>>> exec(code_obj)
[1, 2]
>>>
```

But now, we can look into what a code object looks like. Let's examine some of its properties:

```python
>>> code_obj.co_code
b'd\x00d\x01g\x02Z\x00e\x01e\x00\x83\x01\x01\x00d\x02S\x00'
>>> code_obj.co_filename
'myfile.py'
>>> code_obj.co_names
('x', 'print')
>>> code_obj.co_consts
(1, 2, None)
```

You can see that the variables `x` and `print` used in the code, as well as the constants `1` and `2`, plus a lot more information about our code file is available inside the code object. This has all the information needed to directly run in the Python virtual machine, in order to produce that output.

If you want to dive deep into what the bytecode means, the extras section below on the `dis` module will cover that.

<details>
<summary>Extras: the "dis" module</summary>

The `dis` module in Python ...

```python
>>> import dis
>>> dis.dis('''
... x = [1, 2]
... print(x)
... ''')
  1           0 LOAD_CONST               0 (1)
              2 LOAD_CONST               1 (2)
              4 BUILD_LIST               2
              6 STORE_NAME               0 (x)

  2           8 LOAD_NAME                1 (print)
             10 LOAD_NAME                0 (x)
             12 CALL_FUNCTION            1
             14 POP_TOP
             16 LOAD_CONST               2 (None)
             18 RETURN_VALUE
>>>
```

It shows that:

- Line 1 creates 4 bytecodes, to load 2 constants `1` and `2` onto the stack, build a list from the top `2` values on the stack, and store it into the variable `x`.
- Line 2 creates 6 bytecodes, it loads `print` and `x` onto the stack, and calls the function on the stack with the `1` argument on top of it. Then it gets rid of the return value from the call by doing `POP_TOP` because we didn't use or store the return value from `print(x)`. The two lines at the end returns `None` from the end of the file's execution, which does nothing.

Each of these bytecodes is 2 bytes long when stored as opcodes, that's why the numbers to the left of the opcodes are spaces 2 away from each other. It shows that this entire code is 20 bytes long. And indeed, if you do:

```python
>>> code_obj = compile('''
... x = [1, 2]
... print(x)
... ''', 'test', 'exec')
>>> code_obj.co_code
b'd\x00d\x01g\x02Z\x00e\x01e\x00\x83\x01\x01\x00d\x02S\x00'
>>> len(code_obj.co_code)
20
```

You can confirm that the bytecode generated is exactly 20 bytes.

</details>

`eval` is pretty similar to exec, except it only accepts expressions (not statements or a set of statements like `exec`), and unlike `exec`, it returns a value -- the result of said expression.

Here's an example:

```python
>>> result = eval('1 + 1')
>>> result
2
```

You can also go the long, detailed route with `eval`, you just need to tell `ast.parse` and `compile` that you're expecting to evaluate this code for its value, instead of running it like a Python file.

```python
>>> expr = ast.parse('1 + 1', mode='eval')
>>> code_obj = compile(expr, '<code>', 'eval')
>>> eval(code_obj)
2
```

### `input` and `print`: The bread and butter

`input` and `print` are probably the first two functionalities that you learn about Python. And they seem pretty straightforward, don't they? `input` takes in a line of text, and `print` prints it out, simple as that. Right?

Well, `input` and `print` have a bit more functionality than what you might know about.

Here's the full method signature of `print`:

```python
print(*values, sep=' ', end='\\n', file=sys.stdout, flush=False)
```

The `*values` simply means that you can provide any number of positional arguments to `print`, and it will properly print them out, separated with spaces by default.

If you want the separator to be different, for eg. if you want each item to be printed on a different line, you can set the `sep` keyword accordingly, like `'\n'`:

```python
>>> print(1, 2, 3, 4)
1 2 3 4
>>> print(1, 2, 3, 4, sep='\\n')
1
2
3
4
>>> print(1, 2, 3, 4, sep='\\n\\n')
1

2

3

4
>>>
```

There's also an `end` parameter, if you want a different character for line ends, like, if you don't want a new line to be printed at the end of each print, you can use `end=''`:

```python
>>> for i in range(10):
...     print(i)
0
1
2
3
4
5
6
7
8
9
>>> for i in range(10):
...     print(i, end='')
0123456789
```

Now there's two more parameters to `print`: `file` and `flush`.

`file` refers to the "file" that you are printing to. By default it points to `sys.stdout`, which is a special "file" wrapper, that prints to the console. But if you want `print` to write to a file instead, all you have to do is change the `file` parameter. Something like:

```python
with open('myfile.txt', 'w') as f:
    print('Hello!', file=f)
```

<details>
<summary>Extras: using a context manager to make a print-writer</summary>

Some languages have special objects that let you call `print` method on them, to write to a file by using the familiar "print" interface. In Python, you can go a step beyond that: you can temporarily configure the `print` function to write to a file by default!

This is done by re-assigning `sys.stdout`. If we swap out the file that `sys.stdout` is assigned to, then all `print` statements magically start printing to that file instead. How cool is that?

Let's see with an example:

```python
>>> import sys
>>> print('a regular print statement')
a regular print statement
>>> file = open('myfile.txt', 'w')
>>> sys.stdout = file
>>> print('this will write to the file')  # Gets written to myfile.txt
>>> file.close()
```

But, there's a problem here. We can't go back to printing to console this way. And even if we store the original `stdout`, it would be pretty easy to mess up the state of the `sys` module by accident.

For example:

```python
>>> import sys
>>> print('a regular print statement')
a regular print statement
>>> file = open('myfile.txt', 'w')
>>> sys.stdout = file
>>> file.close()
>>> print('this will write to the file')
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
ValueError: I/O operation on closed file.
```

To avoid accidentally leaving the `sys` module in a broken state, we can use a **context manager**, to ensure that `sys.stdout` is restored when we are done.

```python
import sys
from contextlib import contextmanager

@contextmanager
def print_writer(file_path):
    original_stdout = sys.stdout

    with open(file_path, 'w') as f:
        sys.stdout = f
        yield  # this is where everything inside the `with` statement happens
        sys.stdout = original_stdout

with print_writer('myfile.txt'):
    print('Printing straight to the file!')
    for i in range(5):
        print(i)

print('and regular print still works!')
```

`flush` is a boolean flag to the `print` function. All it does is tell `print` to write the text immediately to the console/file instead of putting it in a buffer. This usually doesn't make much of a difference, but if you're printing a very large string to a console, you might want to set it to `True`
to avoid lag in showing the output to the user.

</details>

Now I'm sure many of you are interested in what secrets the `input` function hides, but there's none. `input` simply takes in a string to show as the prompt. Yeah, bummer, I know.

### `str`, `bytes`, `int`, `bool`, `float` and `complex`: The five primitives

Python has exactly 6 primitive data types (well, actually just 5, but we'll get to that). 4 of these are numerical in nature, and the other 2 are text-based. Let's talk about the text-based first, because that's going to be much simpler.

`str` is one of the most familiar data types in Python. Taking user input using the `input` method gives you a string, and every other data type in Python can be converted into a string. This is necessary because all computer Input/Output is in text-form, be it user I/O or file I/O, which is probably why strings are everywhere.

`bytes` on the other hand, are _actually_ the basis of all I/O in computing. If you know about computers, you would know that all data is stored and handled as bits and bytes -- and that's how terminals really work as well.

If you want to take a peek at the bytes underneath the `input` and `print` calls: you need to take a look at the I/O buffers in the `sys` module: `sys.stdout.buffer` and `sys.stdin.buffer`:

```python
>>> import sys
>>> print('Hello!')
Hello!
>>> 'Hello!\\n'.encode()  # Produces bytes
b'Hello!\\n'
>>> char_count = sys.stdout.buffer.write('Hello!\\n'.encode())
Hello!
>>> char_count  # write() returns the number of bytes written to console
7
```

The buffer objects take in `bytes`, write those directly to the output buffer, and return the number of bytes returned.

To prove that everything is just bytes underneath, let's look at another example:

```python
>>> import sys
>>> '🐍'.encode()
b'\xf0\x9f\x90\x8d'   # utf-8 encoded string of the snake emoji
>>> _ = sys.stdout.buffer.write(b'\xf0\x9f\x90\x8d')
🐍
```

`int` is another widely-used, fundamental primitive data type. It's also the lowest common denominator of 2 other data types: , `float` and `complex`. `complex` is a supertype of `float`, which, in turn, is a supertype of `int`.

What this means is that all `int`s are valid as a `float` as well as a `complex`, but not the other way around. Similarly, all `float`s are also valid as a `complex`.

> If you don't know, `complex` is the implementation for "complex numbers" in Python. They're a really common tool for mathematics.

Let's take a look at them:

```python
>>> x = 5
>>> y = 5.0
>>> z = 5.0+0.0j
>>> type(x), type(y), type(z)
(<class 'int'>, <class 'float'>, <class 'complex'>)
>>> x == y == z  # All the same value
True
>>> y
5.0
>>> float(x)    # float(x) produces the same result as y
5.0
>>> z
(5+0j)
>>> complex(x)  # complex(x) produces the same result as z
(5+0j)
```

Now, I mentioned for a moment that there's actually only 5 primitive data types in Python, not 6. That is because, `bool` is actually not a primitive data type -- it's actually a subclass of `int`!

You can check it yourself, by looking into the `mro` property of these classes.

`mro` stands for "method resolution order". It defines the order in which the methods called on a class are looked for. Essentially, the method calls are first looked for in the class itself, and if it's not present there, it's searched in its parent class, and then its parent, all the way to the top: `object`. Everything in Python inherits from `object`. Yes, everything in Python is an object.

Take a look:

```python
>>> int.mro()
[<class 'int'>, <class 'object'>]
>>> float.mro()
[<class 'float'>, <class 'object'>]
>>> complex.mro()
[<class 'complex'>, <class 'object'>]
>>> str.mro()
[<class 'str'>, <class 'object'>]
>>> bool.mro()
[<class 'bool'>, <class 'int'>, <class 'object'>]
```

You can see from their "ancestry", that all the other data types are not "sub-classes" of anything (except for `object`, which will always be there). Except `bool`, which inherits from `int`.

Now at this point, you might be wondering "WHY? Why does `bool` subclass `int`?" And the answer is a bit anti-climatic. It's mostly because of compatibility reasons. Historically, logical true/false operations tended to simply use `0` for false and `1` for true. In Python version 2.2, the boolean values `True` and `False` were added to Python, and they were simply wrappers around the integer values. The fact has stayed the same till date. That's all.

But, it also means that, for better or for worse, you can pass a `bool` wherever an `int` is expected:

```python
>>> import json
>>> data = {'a': 1, 'b': {'c': 2}}
>>> print(json.dumps(data))
{"a": 1, "b": {"c": 2}}
>>> print(json.dumps(data, indent=4))
{
    "a": 1,
    "b": {
        "c": 2
    }
}
>>> print(json.dumps(data, indent=True))
{
 "a": 1,
 "b": {
  "c": 2
 }
}
```

`indent=True` here is treated as `indent=1`, so it works, but I'm pretty sure nobody would intend that to mean an indent of 1 space. Welp.

### `object`

`object` is the base class of the entire class hierarchy. Everyone inherits from `object`.

The `object` class defines some of the most fundamental properties of objects in Python. Functionalities like being able to hash an object through `hash()`, being able to set attributes and get their value, being able to convert an object into a string representation, and many more.

It does all of this through its pre-defined "magic methods":

```python
>>> dir(object)
['__class__', '__delattr__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__']
```

Accessing an attribute with `obj.x` calls the `__getattr__` method underneath. Similarly setting a new attribute and deleting an attribute calls `__setattr__` and `__detattr__` respectively. The object's hash is generated by the pre-defined `__hash__` method, and the string representation of objects comes from `__repr__`.

```python
>>> object()  # This creates an object with no properties
<object object at 0x7f47aecaf210>  # defined in __repr__()
>>> class dummy(object):
...     pass
>>> x = dummy()
>>> x
<__main__.dummy object at 0x7f47aec510a0>  # functionality inherited from object
>>> hash(object())
8746615746334
>>> hash(x)
8746615722250
>>> x.__hash__()  # is the same as hash(x)
8746615722250
```

> There's actually a lot more to speak about magic methods in Python, as they form the backbone of the object-oriented, duck-typed nature of Python. But, that's a story for another blog. Stay tuned if you're interested 😉

### `type`

If `object` is the father of all classes, `type` is the grandfather.

`type` is the builtin that can be used to dynamically create new classes. Well, it actually has two uses:

- If given a single parameter, it returns the "type" of that parameter, i.e. the class used to make that object:

  ```python
  >>> x = 5
  >>> type(x)
  <class 'int'>
  >>> type(x) is int
  True
  >>> type(x)(42.0)  # Same as int(42.0)
  42
  ```

- If given three parameters, it creates a new class. The three parameters are `name`, `bases`, and `dict`.

  - `name` defines the name of the class
  - `bases` defines the base classes, i.e. superclasses
  - `dict` defines all class attributes and methods.

  So this class definition:

  ```python
  class MyClass(MySuperClass):
      def x(self):
          print('x')
  ```

  Is identical to this class definition:

  ```python
  def x_function(self):
      print('x')

  MyClass = type('MyClass', (MySuperClass,), {'x': x_function})
  ```

  This can be one way to implement the `collections.namedtuple` class, for example, which takes in a class name and a tuple of attributes.

### `list`, `tuple`, `dict`, `set` and `frozenset`: The containers

A "container" in Python refers to a data structure that can hold any number of items inside it.

Python has 5 fundamental container types:

- `list`: Ordered, indexed container. Every element is present at a specific index. Lists are mutable, i.e. items can be added or removed at any time.

  ```python
  >>> my_list = [10, 20, 30]  # Creates a list with 3 items
  >>> my_list[0]              # Indexes start with zero
  10
  >>> my_list[1]              # Indexes increase one by one
  20
  >>> my_list.append(40)      # Mutable: can add values
  >>> my_list
  [10, 20, 30, 40]
  >>> my_list[0] = 50         # Can also reassign indexes
  >>> my_list
  [50, 20, 30, 40]
  ```

- `tuple`: Ordered and indexed just like lists, but with one key difference: They are _immutable_, which means items cannot be added or deleted once the tuple is created.

  ```python
  >>> some_tuple = (1, 2, 3)
  >>> some_tuple[0]              # Indexable
  1
  >>> some_tuple.append(4)       # But NOT mutable
  AttributeError: ...
  >>> some_tuple[0] = 5          # Cannot reassign an index as well
  TypeError: ...
  ```

- `dict`: Unordered key-value pairs. The key is used to access the value. Only one value can correspond to a given key.

  ```python
  >>> flower_colors = {'roses': 'red', 'violets': 'blue'}
  >>> flower_colors['violets']               # Use keys to access value
  'blue'
  >>> flower_colors['violets'] = 'purple'    # Mutable
  >>> flower_colors
  {'roses': 'red', 'violets': 'purple'}
  >>> flower_colors['daffodil'] = 'yellow'   # Can also add new values
  >>> flower_colors
  {'roses': 'red', 'violets': 'purple', 'daffodil': 'yellow'}
  ```

- `set`: Unordered, unique collection of data. Items in a set simply represent their presence or absence. You could use a set to find for example, the kinds of trees in a forest. Their order doesn't matter, only their existance.

  ```python
  >>> forest = ['cedar', 'bamboo', 'cedar', 'cedar', 'cedar', 'oak', 'bamboo']
  >>> tree_types = set(forest)
  >>> tree_types
  {'bamboo', 'oak', 'cedar'}      # Only unique items
  >>> 'oak' in tree_types
  True
  >>> tree_types.remove('oak')    # Sets are also mutable
  >>> tree_types
  {'bamboo', 'cedar'}
  ```

- A `frozenset` is identical to a set, but just like `tuple`s, is immutable.

  ```python
  >>> forest = ['cedar', 'bamboo', 'cedar', 'cedar', 'cedar', 'oak', 'bamboo']
  >>> tree_types = frozenset(forest)
  >>> tree_types
  frozenset({'bamboo', 'oak', 'cedar'})
  >>> 'cedar' in tree_types
  True
  >>> tree_types.add('mahogany')           # CANNOT modify
  AttributeError: ...
  ```

The builtins `list`, `tuple` and `dict` can be used to create empty instances of these data structures too:

```python
>>> x = list()
>>> x
[]
>>> y = dict()
>>> y
{}
```

But the short-form `{...}` and `[...]` is more readable and should be preferred. It's also a tiny-bit faster to use the short-form syntax, as `list`, `dict` etc. are defined inside builtins, and looking up these names inside the variable scopes takes some time, whereas `[]` is understood as a list without any lookup.

### `hash` and `id`: The equality fundamentals

The builtin functions `hash` and `id` make up the backbone of object equality in Python.

Python objects by default aren't comparable, unless they are identical. If you try to create two `object()` items and check if they're equal...

```python
>>> x = object()
>>> y = object()
>>> x == x
True
>>> y == y
True
>>> x == y  # Comparing two objects
False
```

The result will always be `False`. This comes from the fact that `object`s compare themselves by identity: They are only equal to themselves, nothing else.

<details>
<summary>Extras: Sentinels</summary>

For this reason, `object` instances are also sometimes called a "sentinel", because they can be used to check for a value exactly, that can't be replicated.

A nice use-case of sentinel values comes in a case where you need to provide a default value to a function where every possible value is a valid input. A really silly example would be this behaviour:

```python
>>> what_was_passed(42)
You passed a 42.
>>> what_was_passed('abc')
You passed a 'abc'.
>>> what_was_passed()
Nothing was passed.
```

And at first glance, being able to write this code out would be pretty simple:

```python
def what_was_passed(value=None):
    if value is None:
        print('Nothing was passed.')
    else:
        print(f'You passed a {value!r}.')
```

But, this doesn't work. What about this:

```python
>>> what_was_passed(None)
Nothing was passed.
```

Uh oh. We can't explicitly pass a `None` to the function, because that's the default value. We can't really use any other literal or even `...` Ellipsis, because those won't be able to be passed then.

This is where a sentinel comes in:

```python
__my_sentinel = object()

def what_was_passed(value=__my_sentinel):
    if value is __my_sentinel:
        print('Nothing was passed.')
    else:
        print(f'You passed a {value!r}.')
```

And now, this will work for every possible value passed to it.

```python
>>> what_was_passed(42)
You passed a 42.
>>> what_was_passed('abc')
You passed a 'abc'.
>>> what_was_passed(None)
You passed a None.
>>> what_was_passed(object())
You passed a <object object at 0x7fdf02f3f220>.
>>> what_was_passed()
Nothing was passed.
```

</details>

To understand why objects only compare to themselves, we will have to understand the `is` keyword.

Python's `is` operator is used to check if two values reference the same exact object in memory. Think of Python objects like boxes floating around in space, and variables, array indexes, and so on being named arrows pointing to the objects.

Let's take a quick example:

```python
>>> x = object()
>>> y = object()
>>> z = y
>>> x is y
True
>>> y is z
True
```

In the code above, there are two separate objects, and three labels `x` `y` and `z` pointing to these two objects: `x` pointing to the first one, and `y` and `z` both pointing to the other one.

```python
>>> del x
```

This deletes the arrow `x`. The objects themselves aren't affected by assignment, or deletion, only the arrows are. But now that there are no arrows pointing to the first object, it is meaningless to keep it alive. So Python's "garbage collector" gets rid of it. Now we are left with a single `object`.

```python
>>> y = 5
```

Now `y` arrow has been changed to point to an integer object `5` instead. `z` still points to the second `object` though, so it's still alive.

```python
>>> z = y * 2
```

Now z points to yet another new object `10`, which is stored somewhere in memory. Now the second `object` also has nothing pointing to it, so that is subsequently garbage collected.

To be able to verify all of this, we can use the `id` builtin function. `id` spells out the exact location of the object in memory, represented as a number.

```python
>>> x = object()
>>> y = object()
>>> z = y
>>> id(x)
139737240793600
>>> id(y)
139737240793616
>>> id(z)
139737240793616  # Notice the numbers!
>>> x is y
False
>>> id(x) == id(y)
False
>>> y is z
True
>>> id(y) == id(z)
True
```

Same object, same `id`. Different objects, different `id`. Simple as that.

With `object`s, `==` and `is` behaves the same way:

```python
>>> x = object()
>>> y = object()
>>> z = y
>>> x is y
False
>>> x == y
False
>>> y is z
True
>>> y == z
True
```

This is because `object`'s behaviour for `==` is defined to compare the `id`. Something like this:

```python
class object:
    def __eq__(self, other):
        return self is other
```

The actual implementation of `object` is written in C.

> Unlike `==`, there's no way to override the behavior of the `is` operator.

Container types, on the other hand, are equal if they can be replaced with each other. Good examples would be lists with have the same items at the same indices, or sets containing the exact same values.

```python
>>> x = [1, 2, 3]
>>> y = [1, 2, 3]
>>> x is y
False       # Different objects,
>>> x == y
True        # Yet, equal.
```

These can be defined in this way:

```python
class list:
    def __eq__(self, other):
        return all(x == y for x, y in zip(self, other))

        # Can also be written as:
        return all(self[i] == other[i] for i in range(len(self)))
```

> We haven't looked at `all` or `zip` yet, but all this does is make sure all of the given list indices are equal.

Similarly, sets are unordered so even their location doesn't matter, only their "presence":

```python
class list:
    def __eq__(self, other):
        return all(item in other for item in self)
```

Now, related to the idea of "equivalence", Python has the idea of **hashes**. A "hash" of any piece of data refers to a pre-computed value that looks pretty much random, but it can be used to identify that piece of data (to some extent).

Hashes have two specific properties:

- The same piece of data will always have the same hash value.
- Changing the data even very slightly, returns in a drastically different hash.

What this means is that if two values have the same hash, it's very \*likely\* that they have the same value as well.

Comparing hashes is a really fast way to check for "presence". This is what dictionaries and sets use to find values inside them pretty much instantly:

```python
>>> import timeit
>>> timeit.timeit('999 in l', setup='l = list(range(1000))')
12.224023487000522
>>> timeit.timeit('999 in s', setup='s = set(range(1000))')
0.06099735599855194
```

Notice that the set solution is running hunderds of times faster than the list solution! This is because they use the hash values as their replacement for "indices", and if a value _at the same hash_ is already stored in the set/dictionary, Python can quickly check if it's the same item or not. This process makes checking for presence pretty much instant.

<details>
<summary>Extras: hash factoids</summary>

Another little-known fact about hashes is that in Python, all numeric values that compare equal have the same hash:

```python
>>> hash(42) == hash(42.0) == hash(42+0j)
True
```

Another factoid is that immutable container objects such as strings (strings are a sequence of strings), tuples and frozensets, generate their hash by combining the hashes of their items. This allows you to create custom hash functions for your classes simply by composing the `hash` function:

```python
class Car:
    def __init__(self, color, wheels=4):
        self.color = color
        self.wheels = wheels

    def __hash__(self):
        return hash((self.color, self.wheels))
```

</details>

### `bytearray` and `memoryview`: Better byte interfaces

A `bytearray` is the mutable equivalent of a `bytes` object, pretty similar to how lists are essentially mutable tuples.

`bytearray` makes a lot of sense, as:

- A lot of low-level interactions have to do with byte and bit manipulation, like this [horrible implementation for `str.upper`](https://twitter.com/sadhlife/status/1441654357691305989), so having a byte array where you can mutate individual bytes is going to be much more efficien
- Bytes have a fixed size (which is... 1 byte). On the other hand, string characters can have various sizes thanks to the unicode encoding standard, "utf-8":

  ```python
  >>> x = 'I♥🐍'
  >>> len(x)
  3
  >>> x.encode()
  b'I\xe2\x99\xa5\xf0\x9f\x90\x8d'
  >>> len(x.encode())
  8
  >>> x[2]
  '🐍'
  >>> x[2].encode()
  b'\xf0\x9f\x90\x8d'
  >>> len(x[2].encode())
  4
  ```

  So it turns out, that the three-character string 'I♥🐍' is actually eight bytes, with the snake emoji being 4 bytes long. But, in the encoded version of it, we can access each individual byte. And because it's a byte, its "value" will always be between 0 and 255:

  ```python
  >>> x[2]
  '🐍'
  >>> b = x[2].encode()
  >>> b
  b'\xf0\x9f\x90\x8d'  # 4 bytes
  >>> b[:1]
  b'\xf0'
  >>> b[1:2]
  b'\x9f'
  >>> b[2:3]
  b'\x90'
  >>> b[3:4]
  b'\x8d'
  >>> b[0]  # indexing a bytes object gives an integer
  240
  >>> b[3]
  141
  ```

So let's take a look at some byte/bit manipulation examples:

```python
def alternate_case(string):
    """Turns a string into alternating uppercase and lowercase characters."""
    array = bytearray(string.encode())
    for index, byte in enumerate(array):
        if not ((65 <= byte <= 90) or (97 <= byte <= 126)):
            continue

        if index % 2 == 0:
            array[index] = byte | 32
        else:
            array[index] = byte & ~32

    return array.decode()

>>> alternate_case('Hello WORLD?')
'hElLo wOrLd?'
```

This is not a good example, and I'm not going to bother explaining it, but it works, and it is much more efficient than creating a new `bytes` object for every character change.

Meanwhile, a `memoryview` takes this idea a step further: It's pretty much just like a bytearray, but it can refer to an object or a slice _by reference_, instead of creating a new copy for itself. It allows you to pass references to sections of bytes in memory around, and edit it in-place:

```python
>>> array = bytearray(range(256))
>>> array
bytearray(b'\x00\x01\x02\x03\x04\x05\x06\x07\x08...
>>> len(array)
256
>>> array_slice = array[65:91]  # Bytes 65 to 90 are uppercase english characters
>>> array_slice
bytearray(b'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
>>> view = memoryview(array)[65:91]  # Does the same thing,
>>> view
<memory at 0x7f438cefe040>  # but doesn't generate a new new bytearray by default
>>> bytearray(view)
bytearray(b'ABCDEFGHIJKLMNOPQRSTUVWXYZ')  # It can still be converted, though.
>>> view[0]  # 'A'
65
>>> view[0] += 32  # Turns it lowercase
>>> bytearray(view)
bytearray(b'aBCDEFGHIJKLMNOPQRSTUVWXYZ')  # 'A' is now lowercase.
>>> bytearray(view[10:15])
bytearray(b'KLMNO')
>>> view[10:15] = bytearray(view[10:15]).lower()
>>> bytearray(view)
bytearray(b'aBCDEFGHIJklmnoPQRSTUVWXYZ')  # Modified in-place.
```

### `dir` and `vars`: Everything is a dictionary

Have you ever wondered how Python stores objects, their variables, their methods and such? We know that all objects have their own properties and methods attached to them, but hoe exactly does Python keep track of them?

The simple answer is that everything is stored in a dictionary. And the `vars` method exposes the variables stored inside objects and classes.

```python
>>> class C:
...     some_constant = 42
...     def __init__(self, x, y):
...         self.x = x
...         self.y = y
...     def some_method(self):
...         pass
...
>>> c = C(x=3, y=5)
>>> vars(c)
{'x': 3, 'y': 5}
>>> vars(C)
mappingproxy({'__module__': '__main__', 'some_constant': 42, '__init__': <function C.__init__ at 0x7fd27fc66d30>, 'some_method': <function C.some_method at 0x7fd27f350ca0>, '__dict__': <attribute '__dict__' of 'C' objects>, '__weakref__': <attribute '__weakref__' of 'C' objects>, '__doc__': None})
```

As you can see, the attributes `x` and `y` related to the object `c` are stored in its own dictionary, and the methods (`some_function` and `__init__`) are actually stored as functions in the class's dictionary. Which makes sense, as the code of the function itself doesn't change for every object, only the variables passed to it change.

This can be demonstrated with the fact that `c.some_method(x)` is the same as `C.some_method(c, x)`:

```python
>>> class C:
...     def function(self, x):
...         print(f'self={self}, x={x}')

>>> c = C()
>>> C.function(c, 5)
self=<__main__.C object at 0x7f90762461f0>, x=5
>>> c.function(5)
self=<__main__.C object at 0x7f90762461f0>, x=5
```

It shows that a function defined inside a class really is just a function, with `self` just being an object being passed. The object syntax `c.method(x)` is just cleaner syntax to write `C.method(c, x)`.

Now here's a slightly different question. If `vars` shows all methods inside a class, then why does this work?

```python
>>> class C:
...     def function(self, x): pass
...
>>> vars(C)
mappingproxy({'__module__': '__main__', 'function': <function C.function at 0x7f607ddedb80>, '__dict__': <attribute '__dict__' of 'C' objects>, '__weakref__': <attribute '__weakref__' of 'C' objects>, '__doc__': None})
>>> c = C()
>>> vars(c)
{}
>>> c.__class__
<class '__main__.C'>
```

🤔 `__class__` is defined in neither `c`'s dict, nor in `C`... then where is it coming from?

If you want a definitive answer of which properties can be accessed on an object, you can use `dir`:

```python
>>> dir(c)
['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'function']
```

So where are the rest of the properties? Well, the story is slightly more complicated, for one simple reason: Python supports inheritance.

All objects in python inherit by default from the `object` class, and indeed, `__class__` is defined on `object`:

```python
>>> '__class__' in vars(object)
True
>>> vars(object).keys()
dict_keys(['__repr__', '__hash__', '__str__', '__getattribute__', '__setattr__', '__delattr__', '__lt__', '__le__', '__eq__', '__ne__', '__gt__', '__ge__', '__init__', '__new__', '__reduce_ex__', '__reduce__', '__subclasshook__', '__init_subclass__', '__format__', '__sizeof__', '__dir__', '__class__', '__doc__'])
```

And that does cover everything that we see in the output of `dir(c)`.

Now that I've mentioned inheritence, I think I should also mention the "method resolution order". MRO for short, this is the list of classes that an object inherits properties and methods from. Here's a quick example:

```python
>>> class A:
...     def __init__(self):
...         self.x = 'x'
...         self.y = 'y'
...
>>> class B(A):
...     def __init__(self):
...         self.z = 'z'
...
>>> a = A()
>>> b = B()
>>> B.mro()
[<class '__main__.B'>, <class '__main__.A'>, <class 'object'>]
>>> dir(b)
['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'x', 'y', 'z']
>>> set(dir(b)) - set(dir(a))  # all values in dir(b) that are not in dir(a)
{'z'}
>>> vars(b).keys()
dict_keys(['z'])
>>> set(dir(a)) - set(dir(object))
{'x', 'y'}
>>> vars(a).keys()
dict_keys(['x', 'y'])
```

So every level of inheritence adds the newer methods into the `dir` list, and `dir` on a subclass shows all methods found in its method resolution order. And that's how Python suggests method completion in the REPL:

```python
>>> class A:
...     x = 'x'
...
>>> class B(A):
...     y = 'y'
...
>>> b = B()
>>> b.    # Press <tab> twice here
b.x  b.y  # autocompletion!
```

<details>
<summary>Extras: slots?</summary>

`__slots__` are interesting.

Here's one weird/interesting behaviour that Python has:

```python
>>> x = object()
>>> x.foo = 5
AttributeError: 'object' object has no attribute 'foo'
>>> class C:
...     pass
...
>>> c = C()
>>> c.foo = 5
```

So, for some reason you can't assign arbitrary variables to `object`, but you can to an object of a class that you yourself created. Why could that be? Is it specific to `object`?

```python
>>> x = list()
>>> x.foo = 5
AttributeError: 'list' object has no attribute 'foo'
```

Nope. So what's going on?

Well, This is where slots come in. Firstly, let me replicate the behaviour shown by `list` and `object` in my own class:

```python
>>> class C:
...     __slots__ = ()
...
>>> c = C()
>>> c.foo = 5
AttributeError: 'C' object has no attribute 'foo'
```

Now here's the long explanation:

Python actually has two ways of storing data inside objects: as a dictionary (like most cases), and as a "struct". Structs are a C language data type, which can essentially be thought of as tuples from Python. Dictionaries use more memory, because they can be expanded as much as you like and rely on extra space for their reliability in quickly accessing data, that's just how dictionaries are. Structs on the other hand, have a fixed size, and cannot be expanded, but they take the least amount of memory possible as they pack the space those values one after the other.

These two ways of storing data in Python are reflected by the two object properties `__dict__` and `__slots__`. Normally, all instance attributes (`self.foo`) are stored inside `__dict__` the dictionary, unless you define the `__slots__` attribute, in which case the object can only have a constant number of pre-defined attributes.

I can understand if this is getting too confusing. Let me just show an example:

```python
>>> class NormalClass:
...     classvar = 'foo'
...     def __init__(self):
...         self.x = 1
...         self.y = 2
...
>>> n = NormalClass()
>>> n.__dict__
{'x': 1, 'y': 2}  # Note that `classvar` variable isn't here.
>>>               # That is stored in `NormalClass.__dict__`
>>> class SlottedClass:
...     __slots__ = ('x', 'y')
...     classvar = 'foo'  # This is fine.
...     def __init__(self):
...         self.x = 1
...         self.y = 2
...         # Trying to create `self.z` here will cause the same
...         # `AttributeError` as before.
...
>>> n = SlottedClass()
>>> s.__dict__
AttributeError: 'SlottedClass' object has no attribute '__dict__'
>>> s.__slots__
('x', 'y')
```

So creating slots prevents a `__dict__` from existing, which means no dictionary to add attributes into, and it also means saved memory. That's basically it.

AnthonyWritesCode [made a video](https://www.youtube.com/watch?v=BSNd_kxHXL8) about another interesting piece of code relating to slots and their obscure behaviour, do check that out!

</details>

### `hasattr`, `getattr`, `setattr` and `delattr`: Attribute helpers

Now that we've seen that objects are pretty much the same as dictionaries underneath, let's draw a few more paralells between them while we are at it.

We know that accessing as well as reassigning a property inside a dictionary is done using indexing:

```python
>>> dictionary = {'property': 42}
>>> dictionary['property']
42
```

while on an object it is done via the `.` operator:

```python
>>> class C:
...     prop = 42
...
>>> C.prop
42
```

You can even set and delete properties on objects:

```python
>>> C.prop = 84
>>> C.prop
84
>>> del C.prop
AttributeError: type object 'C' has no attribute 'prop'
```

But dictionaries are so much more flexible: you can for example, check if a property exists in a dictionary:

```python
>>> d = {}
>>> 'prop' in d
False
>>> d['prop'] = 'exists'
>>> 'prop' in d
True
```

You _could_ do this in an object by using try-catch:

```python
>>> class X:
...    pass
...
>>> x = X()
>>> try:
...     print(x.prop)
>>> except AttributeError:
...     print("prop doesn't exist.")
prop doesn't exist.
```

But the preferred method to do this would be direct equivalent: `hasattr`

```python
>>> class X:
...    pass
...
>>> x = X()
>>> hasattr(x, 'prop')
False
>>> x.prop = 'exists'
>>> hasattr(x, 'prop')
True
```

Another thing that dictionaries can do is using a variable to index a dict. You can't really do that with objects, right? Let's try:

```python
>>> class X:
...     value = 42
...
>>> x = X()
>>> attr_name = 'value'
>>> x.attr_name
AttributeError: 'X' object has no attribute 'attr_name'
```

Yeah, it doesn't take the variable's value. This should be pretty obvious. But to actually do this, you can use `getattr`, which does take in a string, just like a dictionary key:

```python
>>> class X:
...     value = 42
...
>>> x = X()
>>> getattr(x, 'value')
42
>>> attr_name = 'value'
>>> getattr(x, attr_name)
42  # It works!
```

`setattr` and `delattr` work the same way: they take in the attribute name as a string, and sets/deletes the corresponding attribute accordingly.

```python
>>> class X:
...     value = 42
...
>>> x = X()
>>> setattr(x, 'value', 84)
>>> x.value
84
>>> delattr(x, 'value')  # deletes the attribute completety
>>> hasattr(x, 'value')
False  # `value` no longer exists on the object.
```

Let's try to build something that kinda makes sense with one of these functions:

Sometimes you need to create a function that has to be overloaded to either take a value directly, or take a "factory" object, it can be an object or a function for example, which generates the required value on demand. Let's try to implement that pattern:

```python
class api:
    """A dummy API."""
    def send(item):
        print(f'Uploaded {item!r}!')

def upload_data(item):
    """Uploads the provided value to our database."""
    if hasattr(item, 'get_value'):
        data = item.get_value()
        api.send(data)
    else:
        api.send(item)
```

Yeah, that should be it!

```python
>>> import json
>>> class DataCollector:
...     def __init__(self):
...         self.items = []
...     def add_item(self, item):
...         self.items.append(item)
...     def get_value(self):
...         return json.dumps(self.items)
...
>>> upload_data('some text')
Uploaded 'some text'!
>>> collector = DataCollector()
>>> collector.add_item(42)
>>> collector.add_item(1000)
>>> upload_data(collector)
Uploaded '[42, 1000]'!
```

### `bin`, `hex`, `oct`, `ord`, `chr` and `ascii`: Basic conversions

The `bin`, `hex` and `oct` triplet is used to convert between bases in Python. You give them a number, and they will spit out how you can write that number in that base in your code:

```python
>>> bin(42)
'0b101010'
>>> hex(42)
'0x2a'
>>> oct(42)
'0o52'
>>> 0b101010
42
>>> 0x2a
42
>>> 0o52
42
```

Yeah, you can write numbers in base 2, base 8 or base 16 in your code if you really want to. In the end, they are all completely identical to the integers wriiten in regular decimal:

```python
>>> type(0x20)
<class 'int'>
>>> type(0b101010)
<class 'int'>
>>> 0o100 == 64
True
```

But there are times where it makes sense to use other bases instead, like when writing bytes:

```python
>>> bytes([255, 254])
b'\xff\xfe'              # Not very easy to comprehend
>>> # This can be written as:
>>> bytes([0xff, 0xfe])
b'\xff\xfe'              # An exact one-to-one translation
```

Or when writing OS-specific codes that are implemented in octal, for example:

```python
import os
>>> os.open('file.txt', os.O_RDWR, mode=384)    # ???
>>> # This can be written as:
>>> os.open('file.txt', os.O_RDWR, mode=0o600)  # mode is 600 -> read-write
```

Note that `bin` for example is only supposed to be used when you want to create a binary-representation of a Python integer: If you want a binary string it's better to use Python's string formatting:

```python
>>> f'{42:b}'
101010
```

`ord` and `chr` are used to convert ascii as well as unicode characters and their character codes:

```python
>>> ord('x')
120
>>> chr(120)
'x'
>>> ord('🐍')
128013
>>> hex(ord('🐍'))
'0x1f40d'
>>> chr(0x1f40d)
'🐍'
>>> '\U0001f40d'  # The same value, as a unicode escape inside a string
'🐍'
```

It's pretty simple.

### `format`

`format(string, spec)` is just another way to do `string.format(spec)`.

Python's string formatting can do a lot of interesting things, like:

```python
>>> format(42, 'c')             # int to ascii
'*'
>>> format(604, 'f')            # int to float
'604.000000'
>>> format(357/18, '.2f')       # specify decimal precision
'19.83%'
>>> format(604, 'x')            # int to hex
'25c'
>>> format(604, 'b')            # int to binary
'1001011100'
>>> format(604, '0>16b')        # binary with zero-padding
'0000001001011100'
>>> format('Python!', '🐍^15')  # centered aligned text
'🐍🐍🐍🐍Python!🐍🐍🐍🐍'
```

I have an entire article on string formatting [right here](what-the-f-strings), so check that out for more.

### `any` and `all`

These two are some of my favorite builtins. Not because they are incredibly helpful or powerful, but just because how _Pythonic_ they are. There's certain pieces of logic that can be re-written using `any` or `all`, which will instantly make it much shorter and much more readable, which is what Python is all about. Here's an example of one such case:

Let's say you have a bunch of JSON responses from an API, and you want to make sure that all of them contain an ID field, which is exactly 20 characters long. You could write your code in this way:

```python
def validate_responses(responses):
    for response in responses:
        # Make sure that `id` exists
        if 'id' not in response:
            return False
        # Make sure it is an integer
        if not isinstance(response['id'], str):
            return False
        # Make sure it is 20 characters
        if len(response['id']) != 20:
            return False

    # If everything was True so far for every
    # response, then we can return True.
    return True
```

Or, we can write it in this way:

```python
def validate_responses(responses):
    return all(
        'id' in response
        and isinstance(response['id'], str)
        and len(response['id']) == 20
        for response in responses
    )
```

What `all` does is it takes in an iterator of boolean values, and it returns `False` if it encounters even a single `False` value in the iterator. Otherwise it returns `True`.

And I love the way to do it using `all`, because it reads exactly like english: "Return if id's exist, are integers and are 20 in length, in all responses."

Here's another example: Trying to see if there's any palindromes in the list:

```python
def contains_palindrome(words):
    for word in words:
        if word == ''.join(reversed(word)):
            return True

    # Found no palindromes in the end
    return False
```

vs.

```python
def contains_palindrome(words):
    return any(word == ''.join(reversed(word)) for word in words)
```

And with the wording I believe it should be obvious, that `any` does the opposite of all: it returns `True` if even one value is `True`, otherwise it returns `False`.

<details>
<summary>Extras: listcomps inside any / all</summary>

Note that the code using `any` or `call` could've also been written as a list comprehension:

```python
>>> any([num == 0 for num in nums])
```

Instead of a generator expression:

```python
>>> any(num == 0 for num in nums)
```

Notice the lack of `[]` square brackets in the second one. And you should always prefer using a generator expression in this case, because of how generators work in Python.

Generators are constructs that generate new values _lazily_. What this means is that instead of computing and storing all the values inside a list, it generates one value, provides it to the program, and only generates the next value when it is required.

This means that there's a **huge** difference between these two lines of code:

```python
>>> any(num == 10 for num in range(100_000_000))
True
>>> any([num == 10 for num in range(100_000_000)])
True
```

Not only does the second one store 100 million values in a list for no reason before running `all` over it, it also takes more than 10 seconds on my machine. Meanwhile, because the first one is a generator expression, it generates numbers from 0 to 10 one by one, gives them to `any`, and as soon as the count reaches 10, `any` breaks the iteration and returns `True` almost instantly. Which also means, that it practically runs 10 million times faster in this case.

So, yeah. Never pass list comprehensions inside `any` or `all` when you can pass a generator instead.

</details>

### `abs`, `divmod`, `pow` and `round`: Math basics

These four number functions are so common in programming that they have been thrown straight into the builtins where they are always available, rather than putting them in the `math` module.

They're pretty straightforward:

- `abs` returns the absolute value of a number, eg:

  ```python
  >>> abs(42)
  42
  >>> abs(-3.14)
  3.14
  >>> abs(3-4j)
  5.0
  ```

- `divmod` returns the quotient and remainder after a divide operation:

  ```python
  >>> divmod(7, 2)
  (3, 1)
  >>> quotient, remainder = divmod(5327, 100)
  >>> quotient
  53
  >>> remainder
  27
  ```

- `pow` returns the exponent (power) of a value:

  ```python
  >>> pow(100, 3)
  1000000
  >>> pow(2, 10)
  1024
  ```

- `round` returns a number rounded to the given decimal precision:

  ```python
  >>> import math
  >>> math.pi
  3.141592653589793
  >>> round(math.pi)
  3
  >>> round(math.pi, 4)
  3.1416
  >>> round(1728, -2)
  1700
  ```

### `isinstance` and `issubclass`: Runtime type checking

You've already seen the `type` builtin, and using that knowledge you can already implement runtime type-checking if you need to, like this:

```python
def print_stuff(stuff):
    if type(stuff) is list:
        for item in stuff:
            print(item)
    else:
        print(stuff)
```

Here, we are trying to check if the item is a `list`, and if it is, we print each item inside it individually. Otherwise, we just print the item. And this is what the code does:

```python
>>> print_stuff('foo')
foo
>>> print_stuff(123)
123
>>> print_stuff(['spam', 'eggs', 'steak'])
spam
eggs
steak
```

It does work! So yeah, you can check, at runtime, the type of a variable and change the behaviour of your code. But, there's actually quite a few issues with the code above. Here's one example:

```python
>>> class MyList(list):
...     pass
...
>>> items = MyList(['spam', 'eggs', 'steak'])
>>> items
['spam', 'eggs', 'steak']
>>> print_stuff(items)
['spam', 'eggs', 'steak']
```

Welp, `items` is very clearly still a list, but `print_stuff` doesn't recognize it anymore. And the reason is simple, because `type(items)` is now `MyList`, not `list`.

> This code seems to be violating one of the five SOLID principles, called "Liskov Substitution Principle". The principle says that "objects of a superclass shall be replaceable with objects of its subclasses without breaking the application". This is important for inheritance to be a useful programming paradigm.

The underlying issue of our function is that it doesn't account for inheritence. And that's exactly what `isinstance` is for: It doesn't only check if an object is an instance of a class, it also checks if that object is an instance of a sub-class:

```python
>>> class MyList(list):
...     pass
...
>>> items = ['spam', 'eggs', 'steak']
>>> type(items) is list
True
>>> isinstance(items, list)
True   # Both of these do the same thing
>>> items = MyList(['spam', 'eggs', 'steak'])
>>> type(items) is list
False  # And while `type` doesn't work,
>>> isinstance(items, list)
True   # `isinstance` works with subclasses too.
```

Similarly, `issubclass` checks if a class is a subclass of another class. The first argument for `isinstance` is an object, but for `issubclass` it's another class:

```python
>>> issubclass(MyList, list)
True
```

Replacing the `type` check with `isinstance`, the code above will follow Liskov Substitution Principle. But, it can still be improved. Take this for example:

```python
>>> items = ('spam', 'eggs', 'steak')
>>> print_stuff(items)
('spam', 'eggs', 'steak')
```

Obviously it doesn't handle other container types other than `list` as of now. You could try to work around this by checking for `isinstance` of list, tuple, dictionary, and so on. But how far? How many objects are you going to add support for?

For this case, Python gives you a bunch of "base classes", that you can use to test for certain "behaviours" of your class, instead of testing for the class itself. In our case, the behaviour is being a container of other objects, so aptly the base class is called `Container`:

```python
>>> from collections.abc import Container
>>> items = ('spam', 'eggs', 'steak')
>>> isinstance(items, tuple)
True
>>> isinstance(items, list)
False
>>> isinstance(items, Container)
True  # This works!
```

> We could've also used the `Iterable` base class, but that would behave differently for strings as strings are iterable, but aren't a container. That's why `Container` was chosen here.

Every container object type will return `True` in the check against the `Container` base class. `issubclass` works too:

```python
>>> from collections.abc import Container
>>> issubclass(list, Container)
True
>>> issubclass(tuple, Container)
True
>>> issubclass(set, Container)
True
>>> issubclass(dict, Container)
True
```

So adding that to our code, it becomes:

```python
from collections.abc import Container

def print_stuff(stuff):
    if isinstance(stuff, Container):
        for item in stuff:
            print(item)
    else:
        print(stuff)
```

This style of checking for types actually has a name: it's called "duck typing".

### `callable` and duck typing basics

Famously, Python is referred to as a "duck-typed" language. What it means is that instead of caring about the exact class an object comes from, Python code generally tends to check instead if the object can satisfy certain _behaviours_ that we are looking for.

In the words of Alex Martelli:

> "You don't really care for IS-A -- you really only care for BEHAVES-LIKE-A-(in-this-specific-context), so, if you do test, this behaviour is what you should be testing for.
>
> In other words, don't check whether it IS-a duck: check whether it QUACKS-like-a duck, WALKS-like-a duck, etc, etc, depending on exactly what subset of duck-like behaviour you need to play your language-games with."

To explain this, I'll give you a quick example:

Some items in Python can be "called" to return a value, like functions and classes, while others can't, and will raise a `TypeError` if you try:

```python
>>> def magic():
...     return 42
...
>>> magic()  # Works fine
42
>>> class MyClass:
...     pass
...
>>> MyClass()  # Also works
<__main__.MyClass object at 0x7f2b7b91f0a0>
>>> x = 42
>>> x()  # Doesn't work
TypeError: 'int' object is not callable
```

How do you even begin to check if you can try and "call" a function, class, and whatnot? The answer is actually quite simple: You just see if the object implements a `__call__` special method.

```python
>>> def is_callable(item):
...     return hasattr(item, '__call__')
...
>>> is_callable(list)
True
>>> def function():
...     pass
...
>>> is_callable(function)
True
>>> class MyClass:
...     pass
...
>>> is_callable(MyClass)
True
>>> is_callable('abcd')
False
```

And that's pretty much what the `callable` builtin does:

```python
>>> callable(list)
True
>>> callable(42)
False
```

By the way, these "special methods" is how most of Python's syntax and functionality works:

- `x()` is the same as doing `x.__call__()`
- `items[10]` is the same as doing `items.__getitem__(10)`
- `a + b` is the same as doing `a.__add__(b)`

Nearly every python behavior has an underlying "special method", or what they're sometimes called as, "dunder method" defined underneath.

If you want to read more into these dunder methods, you can read the documentation page about [Python's data model](https://docs.python.org/3/reference/datamodel.html).

### `property`, `classmethod`, `staticmethod`

### `super`

### `sorted` and `reversed`: Sequence manipulators

Sorting and reversing a sequence of data are probably the most used algorithmic operations in any programming language. And the top level `sorted` and `reversed` let you do exactly that.

- `sorted`
  This function sorts the incoming data, and returns a sorted `list` type.

  ```python
  >>> items = (3, 4, 1, 2)
  >>> sorted(items)
  [1, 2, 3, 4]
  ```

  It uses the "TimSort" algorithm created by by Tim Peters, one of the earliest Python wizards.

  There's also two other parameters that `sorted` can take: `reverse`, which when set to `True` sorts the data in reverse order; and `key`, which takes in a function that is used on every element to sort the data based on a custom property of each item. Let's take a look at it:

  ```python
  >>> items = [
  ...   {'value': 3},
  ...   {'value': 1},
  ...   {'value': 2},
  ... ]
  >>> sorted(items, key=lambda d: d['value'])
  [{'value': 1}, {'value': 2}, {'value': 3}]
  >>> names = ['James', 'Kyle', 'Max']
  >>> sorted(names, key=len)  # Sorts by name length
  ['Max', 'Kyle', 'James']
  ```

  Also note, that while `list.sort()` is already one way to sort lists, the `.sort()` method only exists on lists, while `sorted` can take any iterable.

- `reversed`

  `reversed` is a function that takes in any sequence type and returns a **generator**, which yields the values in reversed order.

  Returning a generator is nice, as this means that reversing certain objects takes no extra memory space at all, like `range` or `list`, whose reverse values can be generated one by one.

  ```python
  >>> items = [1, 2, 3]
  >>> x = reversed(items)
  >>> x
  <list_reverseiterator object at 0x7f1c3ebe07f0>
  >>> next(x)
  3
  >>> next(x)
  2
  >>> next(x)
  1
  >>> next(x)
  StopIteration # Error: end of generator
  >>> for i in reversed(items):
  ...     print(i)
  ...
  3
  2
  1
  >>> list(reversed(items))
  [3, 2, 1]
  ```

### `map` and `filter`: Functional primitives

Now in Python, everything might be an object, but that doesn't necessarily mean that your Python code needs to be object-oriented. You can in-fact write pretty easy to read _functional_ code in Python.

If you don't know what functional languages or functional code is, the idea is that all functionality is provided via functions. There isn't a formal concept of classes and objects, inheritance and the like. In essence, all programs simply manipulate pieces of data, by passing them to functions and getting the modified values returned back to you.

> This might be an oversimplification, don't dwell too much on my definition here. But we're moving on.

Two really common concepts in functional programming are **map** and **filter**, and Python provides builtin functions for those:

- `map`

  `map` is a "higher order function", which just means that it's a function that takes in another function as an argument.

  What `map` really does is it maps from one set of values to another. A really simple example would be a square mapping:

  ```python
  >>> def square(x):
  ...     return x * x
  ...
  >>> numbers = [8, 4, 6, 5]
  >>> list(map(square, numbers))
  [64, 16, 36, 25]
  >>> for squared in map(square, numbers):
  ...     print(squared)
  ...
  64
  16
  36
  25
  ```

  `map` takes two arguments: a function, and a sequence. It simply runs that function with each element as input, and it stores all the outputs inside a new list. `map(square, numbers)` Took each of the numbers and returned a list of squared numbers.

  Note that I had to do `list(map(square, numbers))`, and this is because `map` itself returns a generator. The values are lazily mapped one at a time as you request them, e.g. if you loop over a map value, it will run the map function one by one on each item of the sequence. This means that map doesn't store a complete list of mapped values and doesn't waste time computing extra values when not needed.

- `filter`

  `filter` is quite similar to `map`, except it doesn't map every value to a new value, it filters a sequence of values based on a _condition_.

  This means that the output of a filter will contain the same items as the ones that went in, except some may be discarded.

  A really simple example would be to filter out odd numbers from a result:

  ```python
  >>> items = [13, 10, 25, 8]
  >>> evens = list(filter(lambda num: num % 2 == 0, items))
  >>> evens
  [10, 8]
  ```

  A few people might have realised that these functions are essentially doing the same thing as list comprehensions, and you'd be right!

  List comprehensions are basically a more Pythonic, more readable way to write these exact same things:

  ```python
  >>> def square(x):
  ...     return x * x
  ...
  >>> numbers = [8, 4, 6, 5]
  >>> [square(num) for num in numbers]
  [64, 16, 36, 25]
  ```

  ```python
  >>> items = [13, 10, 25, 8]
  >>> evens = [num for num in items if num % 2 == 0]
  >>> evens
  [10, 8]
  ```

  You are free to use whichever syntax seems to suit your usecase better.

### `len`, `max`, `min` and `sum`: Aggregate functions

Python has a few _aggregate_ functions: functions that combine a collection of values into a single result.

I think just a little code example should be more than enough to explain these four:

```python
>>> numbers = [30, 10, 20, 40]
>>> len(numbers)
4
>>> max(numbers)
40
>>> min(numbers)
10
>>> sum(numbers)
100
```

Three of these can infact take any container data type, like sets, dictionaries and even strings:

```python
>>> author = 'guidovanrossum'
>>> len(author)
14
>>> max(author)
'v'
>>> min(author)
'a'
```

`sum` is required to take in a container of numbers. Which means, this works:

```python
>>> sum(b'guidovanrossum')
1542
```

I'll leave that to you to figure out what happened here ;)

### `iter`, `next`

### `range`, `enumerate`, `zip`

### `slice`

A `slice` object is what's used under the hood when you try to slice a Python iterable.

In `my_list[1:]` for example, `[1:3]` is not the special part, only `1:3` is. The square brackets are still trying to index the list! But `1:3` _inside_ these square brackets here actually creates a `slice` object.

This is why, `my_list[1:3]` is actually equivalent to `my_list[slice(1, 3)]`:

```python
>>> my_list = [10, 20, 30, 40]
>>> my_list[1:3]
[20, 30]
>>> my_list[slice(1, 3)]
[20, 30]
>>> nums = list(range(10))
>>> nums
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> nums[1::2]
[1, 3, 5, 7, 9]
>>> s = slice(1, None, 2)  # Equivalent to `[1::2]`
>>> s
slice(1, None, 2)
>>> nums[s]
[1, 3, 5, 7, 9]
```

If you want to learn a bit more about slices, how they work and what all can be done with them, I cover that in a separate article [here](slices).

### `globals`, `locals`

### `breakpoint`: built-in debugging

`breakpoint` was a builtin that was added to Python 3.7, as an easier way to drop into a debugging session. Essentially it just calls `set_trace()` from the `pdb` module, which is the debugger module that is built into Python.

What `pdb` lets you do is stop the execution of your code at any moment, inspect the values of variables, run some code if you like, and then you can even do fancy things like running the code one line at a time, or check the state of the stack frames inside the interpreter.

Using `pdb` to debug your code, by slowly going over it, seeing which lines of code get executed, and inspecting values of objects and variables is a much more efficient way to debug your code than using `print` statements.

Unfortunately there isn't any good way to show a debugger being used in a text-format in a blog. But, AnthonyWritesCode has a [really good video](https://www.youtube.com/watch?v=0LPuG825eAk) explaining some of its features if you're interested.

### `repr`

### `open`

### `help`, `exit`, `quit`

-- defined in site module

### `copyright`, `credits`, `license`

## So what's next?

Well, here's the deal. _Python is huge._

Here's just a few things that we haven't even touched upon yet:

- Threading / Multiprocessing
- Type annotations
- Metaclasses
- Weak references
- Garbage collection
- The 200 or so builtin modules that do everything from html templating, to sending emails, to cryptography.

And that's probably not even all of it.

**But**, the important thing is that you know a LOT about Python's fundamentals now. You know what makes Python tick, you understand its strengths.

The rest of the things you can pick up as you go, you just need to be aware that they exist!

The official Python tutorial has a section on the [builtin modules](https://docs.python.org/3/tutorial/stdlib.html), and the documentation around all of them is actually really good. Reading that whenever you need it will pretty much help you figure out everything as you need it.

So now that you've learned all of this, why don't you build something great?

## The end

Thanks a lot for reading this article. If you managed to read the whole thing, congratulations! And I'd love to know your thoughts on this. Let me know ✨
