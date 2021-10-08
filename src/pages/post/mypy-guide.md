---
title: "The Comprehensive Guide to mypy"
description: "A single article to teach you everything you need to know about Python's type checker."
publishDate: "Thursday, 6 May 2021"
author: "Tushar Sadhwani"
heroImage: "/images/mypy.jpg"
alt: "The Comprehensive Guide to mypy"
layout: "../../layouts/BlogPost.astro"
---

[Mypy](https://github.com/python/mypy) is a **static type checker** for Python. It acts as a linter, that allows you to write statically typed code, and verify the soundness of your types.

All mypy does is check your type hints. It's **not like TypeScript**, which needs to be compiled before it can work. **All mypy code is valid Python, no compiler needed**.

This gives us the advantage of having types, as you can know for certain that there is no type-mismatch in your code, just as you can in typed, compiled languages like C++ and Java, but you also get the benefit of being Python 🐍✨ _(you also get other benefits like null safety!)_

For a more detailed explanation on what are types useful for, head over to the blog I wrote previously: [Does Python need types?](does-python-need-types)

This article is going to be a deep dive for anyone who wants to learn about mypy, and all of its capabilities.

> _If you haven't noticed the article length, this is going to be long. So grab a cup of your favorite beverage, and let's get straight into it._

## Index

- [Index](#index)
- [Setting up mypy](#setting-up-mypy)
  - [Using mypy in the terminal](#using-mypy-in-the-terminal)
  - [Using mypy in VSCode](#using-mypy-in-vscode)
- [Primitive types](#primitive-types)
- [Collection types](#collection-types)
- [Type debugging - Part 1](#type-debugging---part-1)
- [Union and Optional](#union-and-optional)
- [Any type](#any-type)
- [Miscellaneous types](#miscellaneous-types)
  - [Tuple](#tuple)
  - [TypedDict](#typeddict)
  - [Literal](#literal)
  - [Final](#final)
  - [NoReturn](#noreturn)
- [Typing classes](#typing-classes)
- [Typing namedtuples](#typing-namedtuples)
- [Typing decorators](#typing-decorators)
- [Typing generators](#typing-generators)
- [Typing `*args` and `**kwargs`](#typing-args-and-kwargs)
- [Duck types](#duck-types)
- [Function overloading with `@overload`](#function-overloading-with-overload)
- [`Type` type](#type-type)
- [Typing pre-existing projects](#typing-pre-existing-projects)
- [Type debugging - Part 2](#type-debugging---part-2)
- [Typing Context managers](#typing-context-managers)
- [Typing async functions](#typing-async-functions)
- [Generics](#generics)
  - [Generic functions](#generic-functions)
  - [Generic classes](#generic-classes)
  - [Generic types](#generic-types)
- [Advanced/Recursive type checking with `Protocol`](#advancedrecursive-type-checking-with-protocol)
- [Further learning](#further-learning)

## Setting up mypy

All you really need to do to set it up is `pip install mypy`.

### Using mypy in the terminal

Let's create a regular python file, and call it `test.py`:

```python
def double(n):
    return n * 2

num = double(21)
print(num)
```

This doesn't have any type definitions yet, but let's run mypy over it to see what it says.

```bash
$ mypy test.py
Success: no issues found in 1 source file
```

🤨

Don't worry though, it's nothing unexpected. As explained in [my previous article](does-python-need-types), **mypy doesn't force you to add types to your code**. But, if it finds types, it will evaluate them.

This can definitely lead to mypy missing entire parts of your code just because you accidentally forgot to add types.

Thankfully, there's ways to customise mypy to tell it to always check for stuff:

```bash
$ mypy --disallow-untyped-defs test.py
test.py:1: error: Function is missing a return type annotation
Found 1 error in 1 file (checked 1 source file)
```

And now it gave us the error we wanted.

There are a lot of these `--disallow-` arguments that we should be using if we are starting a new project to prevent such mishaps, but mypy gives us an extra powerful one that does it all: `--strict`

```bash
$ mypy --strict test.py
test.py:1: error: Function is missing a return type annotation
test.py:4: error: Call to untyped function "give_number" in typed context
Found 2 errors in 1 file (checked 1 source file)
```

<figcaption>The actual mypy output is all nice and colourful
</figcaption>

This gave us even more information: the fact that we're using `give_number` in our code, which doesn't have a defined return type, so that piece of code also can have unintended issues.

> **TL;DR**: for starters, use `mypy --strict filename.py`

### Using mypy in VSCode

VSCode has pretty good integration with mypy. All you need to get mypy working with it is to add this to your `settings.json`:

```json
...
  "python.linting.mypyEnabled": true,
  "python.linting.mypyArgs": [
    "--ignore-missing-imports",
    "--follow-imports=silent",
    "--show-column-numbers",
    "--strict"
  ],
...
```

Now opening your code folder in python should show you the exact same errors in the "Problems" pane:

![VSCode Problems pane showing the same errors](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7d9go5wksy1ot63f8ib4.png)

> Also, if you're using VSCode I'll highly suggest installing [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance) from the Extensions panel, it'll help a lot with tab-completion and getting better insight into your types.

Okay, now on to actually fixing these issues.

## Primitive types

The most fundamental types that exist in mypy are the primitive types. To name a few:

- `int`
- `str`
- `float`
- `bool`
  ...

Notice a pattern?

Yup. These are the same exact primitive Python data types that you're familiar with.

And these are actually all we need to fix our errors:

```python
def double(n: int) -> int:
    return n * 2


num = double(21)
print(num)
```

All we've changed is the function's definition in `def`:

![The code's diff](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qvdyekz839662s6krh01.png)

<figcaption>Notice the highlighted part</figcaption>

What this says is "function `double` takes an argument `n` which is an `int`, and the function returns an `int`.

And running mypy now:

```bash
$ mypy --strict test.py
Success: no issues found in 1 source file
```

![Ship it!](https://i.fluffy.cc/MKjDMmwXxZlqRTwnn070gVqZ8Rwh6d3p.gif)

Congratulations, you've just written your first type-checked Python program 🎉

We can run the code to verify that it indeed, does work:

```bash
$ python test.py
42
```

> I should clarify, that mypy does all of its type checking without ever running the code. It is what's called a **static analysis tool** (this static is different from the static in "static typing"), and essentially what it means is that it works not by running your python code, but by **evaluating your program's structure**. What this means is, if your program does interesting things like making API calls, or deleting files on your system, you can still run mypy over your files and it will have no real-world effect.

What is interesting to note, is that we have declared `num` in the program as well, but we never told mypy what type it is going to be, and yet it still worked just fine.

We could tell mypy what type it is, like so:

```python
def double(n: int) -> int:
    return n * 2


num: int = double(21)
print(num)
```

And mypy would be equally happy with this as well. But we don't have to provide this type, because mypy knows its type already. Because `double` is only supposed to return an `int`, **mypy inferred it**:

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/enz740p3lztmic7c7us4.png)

<figcaption>Basic inference actually works without Pylance too.</figcaption>

And _inference is cool_. For 80% of the cases, you'll only be writing types for function and method definitions, as we did in the first example. One notable exception to this is "empty collection types", which we will discuss now.

## Collection types

Collection types are how you're able to add types to collections, such as "a list of strings", or "a dictionary with string keys and boolean values", and so on.

Some collection types include:

- `List`
- `Dict`
- `Set`
- `DefaultDict`
- `Deque`
- `Counter`

Now these might sound very familiar, **these aren't the same as the builtin collection types** (more on that later).

These are all defined in the `typing` module that comes built-in with Python, and there's one thing that all of these have in common: they're _generic_.

I have an entire section dedicated to generics below, but what it boils down to is that "with generic types, you can pass types inside other types". Here's how you'd use collection types:

```python
from typing import List

def average(nums: List[int]) -> float:
    total = sum(nums)
    count = len(nums)
    return total / count

print(average([1, 2, 3, 4])) # 2.5
```

This tells mypy that `nums` should be a list of integers (`List[int]`), and that `average` returns a `float`.

Here's a couple more examples:

```python
from typing import Dict

def get_total_marks(scorecard: Dict[str, int]) -> int:
    marks = list(scorecard.values())  # marks : List[int]
    return sum(marks)

scores = {'english': 84, 'maths': 92, 'history': 75}
print(get_total_marks(scores))  # 251
```

Remember when I said that empty collections is one of the rare cases that need to be typed? This is because there's no way for mypy to infer the types in that case:

```python
from typing import List

def unique_count(nums: List[int]) -> int:
    """counts the number of unique items in the list"""
    uniques = set()  # How does mypy know what type this is?
    for num in nums:
        uniques.add(num)

    return len(uniques)

print(unique_count([1, 2, 1, 3, 1, 2, 4, 3, 1]))  # 4
```

Since the set has no items to begin with, mypy can't statically infer what type it should be.

<details>
<summary>PS.</summary>

_Small note, if you try to run mypy on the piece of code above, it'll actually succeed. It's because the mypy devs are smart, and they added simple cases of look-ahead inference. Meaning, new versions of mypy can figure out such types in simple cases. Keep in mind that it doesn't always work._

</details>

To fix this, you can manually add in the required type:

```python
from typing import List, Set

def unique_count(nums: List[int]) -> int:
    """counts the number of unique items in the list"""
    uniques: Set[int] = set()  # Manually added type information
    for num in nums:
        uniques.add(num)

    return len(uniques)

print(unique_count([1, 2, 1, 3, 1, 2, 4, 3, 1]))  # 4
```

> **Note**: Starting from Python 3.7, you can add a future import, `from __future__ import annotations` at the top of your files, which will allow you to use the builtin types as generics, i.e. you can use `list[int]` instead of `List[int]`. If you're using Python 3.9 or above, you can use this syntax without needing the `__future__` import at all. However, there are some edge cases where it might not work, so in the meantime I'll suggest using the `typing.List` variants. This is detailed in [PEP 585](https://www.python.org/dev/peps/pep-0585/).

## Type debugging - Part 1

Let's say you're reading someone else's — or your own past self's — code, and it's not really apparent what the type of a variable is. The code is using a lot of inference, and it's using some builtin methods that you don't exactly remember how they work, bla bla.

Thankfully mypy lets you reveal the type of any variable by using `reveal_type`:

```python
from typing import List, Set

def unique_count(nums: List[int]) -> int:
    """counts the number of unique items in the list"""
    uniques: Set[int] = set()
    for num in nums:
        uniques.add(num)

    return len(uniques)

counts = unique_count([1, 2, 1, 3, 1, 2, 4, 3, 1])

reveal_type(counts)  # The special magic reveal_type method
```

Running mypy on this piece of code gives us:

```bash
$ mypy --strict test.py
test.py:12: note: Revealed type is 'builtins.int'
```

Ignore the builtins for now, it's able to tell us that `counts` here is an `int`.

Cool, right? You don't need to rely on an IDE or VSCode, to use hover to check the types of a variable. A simple terminal and mypy is all you need. _(although VSCode internally uses a similar process to this to get all type informations)_

However, some of you might be wondering where `reveal_type` came from. We didn't import it from `typing`... is it a new builtin? Is that even valid in python?

And sure enough, if you try to run the code:

```bash
$ py test.py
Traceback (most recent call last):
  File "/home/tushar/code/test/test.py", line 12, in <module>
    reveal_type(counts)
NameError: name 'reveal_type' is not defined
```

`reveal_type` is a special "mypy function". Since python doesn't know about types (type annotations are ignored at runtime), only mypy knows about the types of variables when it runs its type checking. So, only mypy can work with `reveal_type`.

All this means, is that **you should only use `reveal_type` to debug your code, and remove it when you're done debugging**.

## Union and Optional

So far, we have only seen variables and collections that can hold only one type of value. But what about this piece of code?

```python
def print_favorite_color(person):
    fav_color = person.get('favorite-color')
    if fav_color is None:
        print("You don't have a favorite color. 😿")
    else:
        print(f"Your favorite color is {fav_color}! 😸.")

me = {'name': 'Tushar', 'favorite-color': 'Purple'}
print_favorite_color(me)
```

What's the type of `fav_color` in this code?

Let's try to do a `reveal_type`:

```python
from typing import Dict

def print_favorite_color(person: Dict[str, str]) -> None:  # added types to funciton definiton
    fav_color = person.get('favorite-color')
    reveal_type(fav_color)  # added this line here
    if fav_color is None:
        print("You don't have a favorite color. 😿")
    else:
        print(f"Your favorite color is {fav_color}! 😸.")

me = {'name': 'Tushar', 'favorite-color': 'Purple'}
print_favorite_color(me)
```

> _BTW, since this function has no return statement, its return type is `None`._

Running mypy on this:

```bash
$ mypy test.py
test.py:5: note: Revealed type is 'Union[builtins.str*, None]'
```

And we get one of our two new types: _Union_. Specifically, `Union[str, None]`.

All this means, is that `fav_color` can be one of two different types, **either `str`, or `None`**.

And unions are actually very important for Python, because of how Python does polymorphism. Here's a simpler example:

```python
def print_item(item):
    if isinstance(item, list):
        for data in item:
            print(data)
    else:
        print(item)

print_item('Hi!')
print_item(['This is a test', 'of polymorphism'])
```

```bash
$ python test.py
Hi!
This is a test
of polymorphism
```

Now let's add types to it, and learn some things by using our friend `reveal_type`:

```python
from typing import List, Union

def print_item(item: Union[str, List[str]]) -> None:
    reveal_type(item)

    if isinstance(item, list):
        for data in item:
            reveal_type(item)
            print(data)
    else:
        reveal_type(item)
        print(item)

print_item('Hi!')
print_item(['This is a test', 'of polymorphism'])
```

Can you guess the output of the `reveal_type`s?

```bash
$ mypy test.py
test.py:4: note: Revealed type is 'Union[builtins.str, builtins.list[builtins.str]]'
test.py:8: note: Revealed type is 'builtins.list[builtins.str]'
test.py:11: note: Revealed type is 'builtins.str'
```

Mypy is smart enough, where if you add an `isinstance(...)` check to a variable, it will correctly assume that the type inside that block is _narrowed to that type._

In our case, `item` was correctly identified as `List[str]` inside the `isinstance` block, and `str` in the `else` block.

This is an extremely powerful feature of mypy, called **Type narrowing**.

Now, here's a more contrived example, a type-annotated Python implementation of the builtin function `abs`:

```python
from math import sqrt
from typing import Union

def my_abs(num: Union[int, float, complex]) -> float:
    if isinstance(num, complex):
        # absolute value of a complex number is sqrt(i^2 + j^2)
        return sqrt(num.real ** 2 + num.imag ** 2)

    else:
        return num if num > 0 else -num

print(my_abs(-5.6))  # 5.6
print(my_abs(42))    # 42
print(my_abs(0))     # 0
print(my_abs(6-8j))  # 10.0
```

And that's everything you need to know about Union.

... so what's `Optional` you ask?

Well, `Union[X, None]` seemed to occur so commonly in Python, that they decided it needs a shorthand. `Optional[str]` is just a shorter way to write `Union[str, None]`.

## Any type

If you ever try to run `reveal_type` inside an untyped function, this is what happens:

```python
def average(nums):
    total = sum(nums)
    count = len(nums)

    ans = total / count
    reveal_type(ans)
```

```bash
$ mypy test.py
test.py:6: note: Revealed type is 'Any'
test.py:6: note: 'reveal_type' always outputs 'Any' in unchecked functions
```

<figcaption>Didn't use --strict, or it'd throw errors</figcaption>

The revealed type is told to be `Any`.

`Any` just means that _anything can be passed here_. Whatever is passed, mypy should just accept it. In other words, **`Any` turns off type checking**.

Of course, this means that _if you want to take advantage of mypy, you should avoid using `Any` as much as you can_.

But since Python is inherently a dynamically typed language, in some cases it's impossible for you to know what the type of something is going to be. For such cases, you can use `Any`. For example:

```python
import json
from typing import Any

import requests

def post_data_to_api(data: Any) -> None:
    requests.post('https://example.com/post', json=data)

data = '{"num": 42, "info": null}'
parsed_data = json.loads(data)
reveal_type(parsed_data)  # Revealed type is 'Any'

post_data_to_api(data)
```

You can also use `Any` as a placeholder value for something while you figure out what it should be, to make mypy happy in the meanwhile. But make sure to get rid of the `Any` if you can .

## Miscellaneous types

### Tuple

You might think of tuples as an immutable list, but Python thinks of it in a very different way.

Tuples are different from other collections, as they are essentially a way to represent a collection of data points related to an entity, kinda similar to how a C `struct` is stored in memory. While other collections usually represent a bunch of objects, **tuples usually represent a single object**.

A good example is sqlite:

```python
>>> for row in cursor.execute('SELECT name, age, bio FROM users'):
...     print(row)
('Joe', 23, 'Hello!')
('Mike', 27, 'Web developer from California.')
>>>
```

Tuples also come in handy when you want to return multiple values from a function, for example:

```python
def next_two(x):
    return x+1, x+2

nums = next_two(3)
print(nums)  # (4, 5)
```

Because of these reasons, tuples tend to have a fixed length, with each index having a specific type. (Our sqlite example had an array of length 3 and types `int`, `str` and `int` respectively.

Here's how you'd type a tuple:

```python
from typing import Tuple

def print_info(user_info: Tuple[str, int, str]) -> None:
    name, age, bio = user_info
    print(f"My name is {name}, I am {age} years old, and I am a {bio}")

user_info = ('Tushar', 21, 'Developer from India.')
print_info(user_info) # My name is Tushar, I am 21 years old, and I am a Developer from India.
```

However, sometimes you do have to create variable length tuples. You can use the `Tuple[X, ...]` syntax for that.

The `...` in this case simply means there's a variable number of elements in the array, but their type is `X`. For example:

```python
from typing import Tuple

def print_veggies(veggies: Tuple[str, ...]) -> None:
    for veg in veggies:
        print(veg)

veggies = ('Potato', 'Tomato', 'Onion')
print_veggies(veggies)
```

### TypedDict

A `TypedDict` is a dictionary whose keys are always string, and values are of the specified type. At runtime, it behaves exactly like a normal dictionary.

```python
class Vector(TypedDict):
    x: int
    y: int
    label: str

# Can also be created as:
# Vector = TypedDict('Vector', x=int, y=int, label=str)

a: Vector = {'x': 1, 'y': 2, 'label': 'good'}  # OK
b: Vector = {'z': 3, 'label': 'bad'}           # Fails type check

print(Vector(x=1, y=2, label='first') == dict(x=1, y=2, label='first')) # True
```

By default, all keys must be present in a `TypedDict`. It is possible to override this by specifying `total=False`.

### Literal

A `Literal` represents the type of a literal value. You can use it to constrain already existing types like `str` and `int`, to just some specific values of them. Like so:

```python
from typing import Literal

def i_only_take_5(val : Literal[5]) -> None:
    print("yay! you passed a 5!")

i_only_take_5(5)  # OK
i_only_take_5(6)  # Fails type check
```

```bash
$ mypy test.py
test.py:7: error: Argument 1 to "i_only_take_5" has incompatible type "Literal[6]"; expected "Literal[5]"
```

This has some interesting use-cases. A notable one is to use it in place of simple enums:

```python
from typing import Any, Literal

def make_request(method: Literal['GET', 'POST', 'DELETE'], data: Any) -> None:
    print(f'makinng a {method} HTTP request...')
    # ... HTTP code here

make_request('GET', {'user_id': 1234})    # OK
make_request('DLETE', {'user_id': 1234})  # Fails type check
```

```bash
$ mypy test.py
test.py:8: error: Argument 1 to "make_request" has incompatible type "Literal['DLETE']"; expected "Union[Literal['GET'], Literal['POST'], Literal['DELETE']]"
```

Oops, you made a typo in `'DELETE'`! Don't worry, mypy saved you an hour of debugging.

### Final

`Final` is an annotation that declares a variable as final. What that means that the variable cannot be re-assigned to. This is similar to `final` in Java and `const` in JavaScript.

```python
from typing import Final

api_url : Final = 'https://example.com/m_api'

# ... some other code

api_url = 'something else'  # Error: Cannot assign to final name "api_url"
```

### NoReturn

`NoReturn` is an interesting type. It's rarely ever used, but it still needs to exist, for that one time where you might have to use it.

There are cases where you can have a function that might never return. Two possible reasons that I can think of for this are:

- The function always raises an exception, or
- The function is an infinite loop.

Here's an example of both:

```python
from queue import Queue
from typing import NoReturn

message_queue: Queue[str] = Queue()

def event_loop() -> NoReturn:
    while True:
        message = message_queue.get()
        print(f'got {message}')
        # ... do something with the message
```

Note that in both these cases, typing the function as `-> None` will also work. But if you intend for a function to never return anything, you should type it as `NoReturn`, because then mypy will show an error if the function were to ever have a condition where it does return.

For example, if you edit `while True:` to be `while False:` or `while some_condition()` in the first example, mypy will throw an error:

```bash
$ mypy test.py
test.py:6: error: Implicit return in function which does not return
```

## Typing classes

All class methods are essentially typed just like regular functions, except for `self`, which is left untyped. Here's a simple Stack class:

```python
from typing import List

class Stack:
    def __init__(self) -> None:
        self._values: List[int] = []

    def __repr__(self) -> str:
        return f'Stack{self._values!r}'

    def push(self, value: int) -> None:
        self._values.append(value)

    def pop(self) -> int:
        if len(self._values) == 0:
            raise RuntimeError('Underflow!')

        return self._values.pop()

stack = Stack()
print(stack)        # Stack[]

stack.push(2)
stack.push(10)
print(stack)        # Stack[2, 10]

print(stack.pop())  # 10
print(stack)        # Stack[2]
```

> If you've never seen the `{x!r}` syntax inside f-strings, it's a way to use the `repr()` of a value. For more information, [pyformat.info](https://pyformat.info) is a very good resource for learning Python's string formatting features.

There's however, one caveat to typing classes: You can't normally access the class itself inside the class' function declarations (because the class hasn't been finished declaring itself yet, because you're still declaring its methods).

So something like this isn't valid Python:

```python
class MyClass:
    def __init__(self, x: str) -> None:
        self.x = x

    def copy(self) -> MyClass:
        copied_object = MyClass(x=self.x)
        return copied_object
```

```bash
$ mypy --strict test.py
Success: no issues found in 1 source file

$ python test.py
Traceback (most recent call last):
  File "/home/tushar/code/test/test.py", line 11, in <module>
    class MyClass:
  File "/home/tushar/code/test/test.py", line 15, in MyClass
    def copy(self) -> MyClass:
NameError: name 'MyClass' is not defined
```

There's two ways to fix this:

- Turn the classname into a string: The creators of PEP 484 and Mypy knew that such cases exist where you might need to define a return type which doesn't exist yet. So, mypy is able to check types if they're wrapped in strings.

```python
class MyClass:
    def __init__(self, x: str) -> None:
        self.x = x

    def copy(self) -> 'MyClass':
        copied_object = MyClass(x=self.x)
        return copied_object
```

- Use `from __future__ import annotations`. What this does, is turn on a new feature in Python called "postponed evaluation of type annotations". This essentially makes Python treat all type annotations as strings, storing them in the internal `__annotations__` attribute. Details are described in [PEP 563](https://www.python.org/dev/peps/pep-0563/).

```python
from __future__ import annotations

class MyClass:
    def __init__(self, x: str) -> None:
        self.x = x

    def copy(self) -> MyClass:
        copied_object = MyClass(x=self.x)
        return copied_object
```

> Starting with Python 3.11, the Postponed evaluation behaviour will become default, and you won't need to have the `__future__` import anymore.

## Typing namedtuples

`namedtuple`s are a lot like tuples, except every index of their fields is named, and they have some syntactic sugar which allow you to access its properties like attributes on an object:

```python
from collections import namedtuple

Person = namedtuple('Person', ('name', 'age', 'bio'))
ishan = Person('Ishan', 31, 'Writer')

print(ishan)      # Person(name='Ishan', age=31, bio='Writer')
print(ishan[1])   # 31
print(ishan.bio)  # Writer
```

Since the underlying data structure is a tuple, and there's no real way to provide any type information to namedtuples, by default this will have a type of `Tuple[Any, Any, Any]`.

To combat this, Python has added a `NamedTuple` class which you can extend to have the typed equivalent of the same:

```python
from typing import NamedTuple

class Person(NamedTuple):
    name: str
    age: int
    bio: str

ishan = Person('Ishan', 31, 'Writer')

print(ishan)        # Person(name='Ishan', age=31, bio='Writer')
print(ishan[1])     # 31
print(ishan.bio)    # Writer

reveal_type(ishan)  # Revealed type is Tuple[str, int, str]
```

<details>
<summary>Inner workings of NamedTuple:</summary>

If you're curious how `NamedTuple` works under the hood: `age: int` is a **type declaration**, without any assignment (like `age : int = 5`).

Type declarations inside a function or class don't actually define the variable, but they add the type annotation to that function or class' _metadata_, in the form of a dictionary entry, into `x.__annotations__`.

Doing `print(ishan.__annotations__)` in the code above gives us `{'name': <class 'str'>, 'age': <class 'int'>, 'bio': <class 'str'>}`.

`typing.NamedTuple` uses these annotations to create the required tuple.

</details>

## Typing decorators

Decorators are a fairly advanced, but really powerful feature of Python. If you don't know anything about decorators, I'd recommend you to watch [Anthony explains decorators](https://www.youtube.com/watch?v=WDMr6WolKUM), but I'll explain it in brief here as well.

A decorator is essentially a function that wraps another function. Decorators can extend the functionalities of pre-existing functions, by running other side-effects whenever the original function is called. A decorator **decorates a function by adding new functionality**.

A simple example would be to monitor how long a function takes to run:

```python
from time import time, sleep

def time_it(func):
    def wrapper():
        start_time = time()
        func()
        end_time = time()
        duration = end_time - start_time
        print(f'function took {duration:.2f} seconds to run')

    return wrapper

@time_it
def long_computation():
    sleep(2)
    return 42

long_computation()
```

To be able to type this, we'd need a way to be able to define the type of a function. That way is called `Callable`.

`Callable` is a generic type with the following syntax:

`Callable[[<list of argument types>], <return type>]`

The types of a function's arguments goes into the first list inside `Callable`, and the return type follows after. A few examples:

```python
from typing import Dict, Optional

def func1() -> None:
    pass

def func2(x: int, y: str) -> bool:
    return True

def func3(nums: Dict[str, int]) -> Optional[int]:
    return nums.get('test')

reveal_type(func1)  # Callable[[], None]
reveal_type(func2)  # Callable[[int, str], bool]
reveal_type(func3)  # Callable[[Dict[str, int]], Union[int, None]]
```

Here's how you'd implenent the previously-shown `time_it` decorator:

```python
from time import time, sleep
from typing import Callable

def time_it(func: Callable[[], int]) -> Callable[[], int]:
    def wrapper() -> int:
        start_time = time()
        func()
        end_time = time()
        duration = end_time - start_time
        print(f'function took {duration:.2f} seconds to run')

    return wrapper

@time_it
def long_computation() -> int:
    sleep(2)
    return 42

long_computation()
```

> Note: `Callable` is what's called a [Duck Type](https://devopedia.org/duck-typing). What it means, is that you can create your own custom object, and make it a valid `Callable`, by implementing the magic method called `__call__`. I have a dedicated section where I go in-depth about duck types ahead.

## Typing generators

Generators are also a fairly advanced topic to completely cover in this article, and you can watch
[Anthony explains generators](https://www.youtube.com/watch?v=LjBa9sfJh7U) if you've never heard of them. A brief explanation is this:

Generators are a bit like perpetual functions. Instead of returning a value a single time, they `yield` values out of them, which you can iterate over. When you `yield` a value from an iterator, its execution pauses. But when another value is requested from the generator, it resumes execution from where it was last paused. When the generator function returns, the iterator stops.

Here's an example:

```python
def generator(n):
    yield 'start'

    for i in range(n):
        yield f'item number {i+1}'

    yield 'end'

    return 42

for string in generator(3):
    print(string)

# Output:
# start
# item number 1
# item number 2
# item number 3
# end
```

To add type annotations to generators, you need `typing.Generator`. The syntax is as follows:

`Generator[yield_type, throw_type, return_type]`

With that knowledge, typing this is fairly straightforward:

```python
from typing import Generator

def generator(n: int) -> Generator[str, None, int]:
    yield 'start'

    for i in range(n):
        yield f'item number {i+1}'

    yield 'end'

    return 42

for string in generator(3):
    print(string)
```

Since we're not raising any errors in the generator, `throw_type` is `None`. And although the return type is `int` which is correct, we're not really using the returned value anyway, so you could use `Generator[str, None, None]` as well, and skip the `return` part altogether.

## Typing `*args` and `**kwargs`

`*args` and `**kwargs` is a feature of python that lets you pass any number of arguments and keyword arguments to a function _(that's what the name `args` and `kwargs` stands for, but these names are just convention, you can name the variables anything)_. [Anthony explains args and kwargs](https://www.youtube.com/watch?v=CqafM-bsnW0) pretty well in his video.

All the extra arguments passed to `*args` get turned into a tuple, and kewyord arguments turn into a dictionay, with the keys being the string keywords:

```python
def i_can_take_any_values(*args, **kwargs):
    print('got args:', args)
    print('got kwargs:', kwargs)

i_can_take_any_values(1, 16, 'Hello', x=False, answer=42)
# Output:
# got args: (1, 16, 'Hello')
# got kwargs: {'x': False, 'answer': 42}
```

Since the `*args` will always be of typle `Tuple[X]`, and `**kwargs` will always be of type `Dict[str, X]`, we only need to provide one type value `X` to type them. Here's a practical example:

```python
from typing import NamedTuple, Optional

class Scorecard(NamedTuple):
    english: Optional[int]
    maths: Optional[int]
    physics: Optional[int]

def build_scorecard(**marks: int) -> Scorecard:
    reveal_type(marks)  # Revealed type is 'Dict[str, int]'

    card = Scorecard(
        english=marks.get('english'),
        maths=marks.get('maths'),
        physics=marks.get('physics'),
    )
    return card

marks = {'english': 55, 'physics': 84}
print(build_scorecard(**marks))  # Scorecard(english=55, maths=None, physics=84)
```

## Duck types

**Duck types** are a pretty fundamental concept of python: the entirety of the [Python object model](https://docs.python.org/3/reference/datamodel.html) is built around the idea of duck types.

Quoting Alex Martelli:

> "You don't really care for IS-A -- you really only care for BEHAVES-LIKE-A-(in-this-specific-context), so, if you do test, this behaviour is what you should be testing for."

What it means is that Python doesn't really care _what_ the type of an object is, but rather **how does it behave**.

I had a short note above in [typing decorators](#typing-decorators) that mentioned duck typing a function with `__call__`, now here's the actual implementation:

```python
from typing import Callable

def func() -> int:
    return 42

class FakeFuncs:
    def __call__(self) -> int:
        return 42

fake_func = FakeFuncs()


print(func())                           # 42
print(fake_func())                      # 42

print(isinstance(func, Callable))       # True
print(isinstance(fake_func, Callable))  # True

reveal_type(func)                       # Callable[[], int]
reveal_type(fake_func)                  # FakeFuncs
```

<details>
<summary>PS.</summary>

_Running mypy over the above code is going to give a cryptic error about "Special Forms", don't worry about that right now, we'll fix this in the [Protocol](#protocol) section. All I'm showing right now is that the Python code works._

</details>

You can see that Python agrees that both of these functions are "Call-able", i.e. you can call them using the `x()` syntax. (this is why the type is called `Callable`, and not something like `Function`)

What duck types provide you is to be able to define your function parameters and return types not in terms of _concrete classes_, but in terms of _how your object behaves_, giving you a lot more flexibility in what kinds of things you can utilize in your code now, and also allows much easier extensibility in the future without making "breaking changes".

A simple example here:

```python
from typing import List

def count_non_empty_strings(strings: List[str]) -> int:
    return len([s for s in strings if s != ''])


print(count_non_empty_strings(['abc', '', 'def', '']))  # Output: 2
print(count_non_empty_strings(['']))                    # Output: 0


lines = {1: 'abc', 2: 'xyz', 3: ''}
print(count_non_empty_strings(lines.values()))          # Output: 2
```

Running this code with Python works just fine. But running mypy over this gives us the following error:

```bash
$ mypy test.py
test.py:12: error: Argument 1 to "count_non_empty_strings" has incompatible type "ValuesView[str]"; expected "List[str]"
```

`ValuesView` is the type when you do `dict.values()`, and although you could imagine it as a list of strings in this case, it's not exactly the type `List`.

In fact, none of the other sequence types like `tuple` or `set` are going to work with this code. You could patch it for some of the builtin types by doing `strings: Union[List[str], Set[str], ...]` and so on, but just how many types will you add? And what about third party/custom types?

The correct solution here is to use a **Duck Type** (yes, we finally got to the point). The only thing we want to ensure in this case is that the object can be iterated upon (which in Python terms means that it implements the `__iter__` magic method), and the right type for that is `Iterable`:

```python
from typing import Iterable

def count_non_empty_strings(strings: Iterable[str]) -> int:
    return len([s for s in strings if s != ''])


print(count_non_empty_strings(['abc', '', 'def', '']))  # Output: 2
print(count_non_empty_strings(['']))                    # Output: 0


lines = {1: 'abc', 2: 'xyz', 3: ''}
print(count_non_empty_strings(lines.values()))          # Output: 2
```

And now mypy is happy with our code.

There are many, _many_ of these duck types that ship within Python's `typing` module, and a few of them include:

- `Sequence` for defining things that can be indexed and reversed, like `List` and `Tuple`.
- `MutableMapping`, for when you have a key-value pair kind-of data structure, like `dict`, but also others like `defaultdict`, `OrderedDict` and `Counter` from the collections module.
- `Collection`, if all you care about is having a finite number of items in your data structure, eg. a `set`, `list`, `dict`, or anything from the collections module.

> If you haven't already at this point, you should really look into how python's syntax and top level functions hook into Python's object model via `__magic_methods__`, for essentially all of Python's behaviour. The documentation for it is [right here](https://docs.python.org/3/reference/datamodel.html), and there's an excellent [talk by James Powell](https://www.youtube.com/watch?v=7lmCu8wz8ro) that really dives deep into this concept in the beginning.

## Function overloading with `@overload`

Let's write a simple `add` function that supports `int`'s and `float`'s:

```python
from typing import Union

def add(num1: Union[int, float], num2: Union[int, float]) -> Union[int, float]:
    return num1 + num2


print(add(1, 2))    # 3
print(add(3, 4.5))  # 7.5

list_a, list_b = [1, 2, 3], [4, 5, 6, 7]

joined_list = list_a + list_b
last_index = add(len(list_a), len(list_b)) - 1

print(joined_list[last_index])  # 7
```

The implementation seems perfectly fine... but mypy isn't happy with it:

```bash
$ test.py:15: error: No overload variant of "__getitem__" of "list" matches argument type "float"
test.py:15: note: Possible overload variants:
test.py:15: note:     def __getitem__(self, int) -> int
test.py:15: note:     def __getitem__(self, slice) -> List[int]
```

What mypy is trying to tell us here, is that in the line:

`print(joined_list[last_index])`

`last_index` _could_ be of type `float`. And checking with reveal_type, that definitely is the case:

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fbiimqc22expxgmdgsks.png)

And since it _could_, mypy won't allow you to use a possible float value to index a list, because that will error out.

One thing we could do is do an `isinstance` assertion on our side to convince mypy:

```python
from typing import Union


def add(num1: Union[int, float], num2: Union[int, float]) -> Union[int, float]:
    return num1 + num2


print(add(1, 2))    # 3
print(add(3, 4.5))  # 7.5

list_a, list_b = [1, 2, 3], [4, 5, 6, 7]

joined_list = list_a + list_b
last_index = add(len(list_a), len(list_b)) - 1

reveal_type(last_index)             # Union[int, float]
assert isinstance(last_index, int)
reveal_type(last_index)             # Now it's int

print(joined_list[last_index])
```

But this will be pretty cumbersome to do at every single place in our code where we use `add` with `int`'s. Also we as programmers _know_, that passing two `int`'s will only ever return an `int`. But how do we tell mypy that?

Answer: use `@overload`. The syntax basically replicates what we wanted to say in the paragraph above:

```python
from typing import Union, overload

@overload
def add(num1: int, num2: int) -> int: ...

@overload
def add(num1: float, num2: float) -> float: ...

def add(num1: Union[int, float], num2: Union[int, float]) -> Union[int, float]:
    return num1 + num2


print(add(1, 2))    # 3
print(add(3, 4.5))  # 7.5

list_a, list_b = [1, 2, 3], [4, 5, 6, 7]

joined_list = list_a + list_b
last_index = add(len(list_a), len(list_b)) - 1

print(joined_list[last_index])
```

And now mypy knows that `add(3, 4)` returns an `int`.

> Note that Python has no way to ensure that the code actually always returns an `int` when it gets `int` values. It's your job as the programmer providing these overloads, to verify that they are correct. This is why in some cases, using `assert isinstance(...)` could be better than doing this, but for most cases `@overload` works fine.
> Also, in the overload definitions `-> int: ...`, the `...` at the end is a convention for when you provide [type stubs](https://mypy.readthedocs.io/en/stable/stubs.html) for functions and classes, but you could technically write anything as the function body: `pass`, `42`, etc. It'll be ignored either way.

Another good overload example is this:

```python
from typing import BinaryIO, TextIO, Union, overload

@overload
def read_file(file: TextIO) -> str: ...
@overload
def read_file(file: BinaryIO) -> bytes: ...

def read_file(file: Union[TextIO, BinaryIO]) -> Union[str, bytes]:
    data = file.read()
    print('length of data is', len(data))
    return data
```

## `Type` type

`Type` is a type used to type classes. It derives from python's way of determining the type of an object at runtime:

```python
a, b = 1, 2
s = 'hello'

print(type(a))             # <class 'int'>
print(type(b))             # <class 'int'>
print(type(a) == int)      # True
print(type(a) == type(b))  # True
print(type(a) == type(s))  # False
```

> You'd usually use `isinstance(x, int)` instead of `type(x) == int` to check for behaviour, but sometimes knowing the exact type can help, for eg. in optimizations.

Since `type(x)` returns the class of `x`, the type of a class `C` is `Type[C]`:

```python
from typing import Any, Type

class MyClass:
    def __init__(self, x: int) -> None:
        self.x = x

    def __repr__(self) -> str:
        return f'C(x={self.x})'


def make_object(cls: Type[Any], *args: Any) -> Any:
    print('making object of', cls)
    obj = cls(*args)
    return obj


c = make_object(MyClass, 42) # Making object of <class '__main__.MyClass'>

print(c)    # C(x=42)
print(c.x)  # 42
```

> We had to use `Any` in 3 places here, and 2 of them can be eliminated by using [generics](#generics), and we'll talk about it later on.

## Typing pre-existing projects

If you need it, mypy gives you the ability to add types to your project without ever modifying the original source code. It's done using what's called "stub files".

Stub files are python-like files, that only contain **type-checked variable, function, and class definitions**. It's kindof like a mypy _header file_.

You can make your own type stubs by creating a `.pyi` file:

```python
#test.py

cache = {}

def fibonacci(n):
    """Fibonacci series implementation"""
    if n <= 1:
        return 1

    if n in cache:
        return cache[n]

    result = fibonacci(n-1) + fibonacci(n-2)
    cache[n] = result
    return result

for i in range(6):
    print(fibonacci(i))

# Output:
# 1
# 1
# 2
# 3
# 5
# 8
```

```python
# test.pyi
from typing import Dict

cache: Dict[int, int]
def fibonacci(n: int) -> int: ...
```

Now, run mypy on the current folder (make sure you have an `__init__.py` file in the folder, if not, create an empty one).

```bash
$ ls
__init__.py  test.py  test.pyi

$ mypy --strict .
Success: no issues found in 2 source files
```

## Type debugging - Part 2

Since we are on the topic of projects and folders, let's discuss another one of pitfalls that you can find yourselves in when using mypy.

The first one is [PEP 420](https://www.python.org/dev/peps/pep-0420/)

A fact that took me some time to realise, was that **for mypy to be able to type-check a folder, the folder must be a module**.

Let's say you find yourself in this situatiion:

```bash
$ tree
.
├── test.py
└── utils
    └── foo.py

1 directory, 2 files

$ cat test.py
from utils.foo import average

print(average(3, 4))

$ cat utils/foo.py
def average(x: int, y: int) -> float:
    return float(x + y) / 2

$ py test.py
3.5

$ mypy test.py
test.py:1: error: Cannot find implementation or library stub for module named 'utils.foo'
test.py:1: note: See https://mypy.readthedocs.io/en/latest/running_mypy.html#missing-imports
Found 1 error in 1 file (checked 1 source file)
```

What's the problem? Python is able to find `utils.foo` no problems, why can't mypy?

The error is very cryptic, but the thing to focus on is the word "module" in the error. `utils.foo` should be a module, and for that, the `utils` folder should have an `__init__.py`, even if it's empty.

```bash
$ tree
.
├── test.py
└── utils
    ├── foo.py
    └── __init__.py

1 directory, 3 files

$ mypy test.py
Success: no issues found in 1 source file
```

Now, the same issue re-appears if you're installing your package via pip, because of a completely different reason:

```bash
$ tree ..
..
├── setup.py
├── src
│   └── mypackage
│       ├── __init__.py
│       └── utils
│           ├── foo.py
│           └── __init__.py
└── test
    └── test.py

4 directories, 5 files

$ cat ../setup.py
from setuptools import setup, find_packages

setup(
    name="mypackage",
    packages = find_packages('src'),
    package_dir = {"":"src"}
)

$ pip install ..
[...]
successfully installed mypackage-0.0.0

$ cat test.py
from mypackage.utils.foo import average

print(average(3, 4))

$ python test.py
3.5

$ mypy test.py
test.py:1: error: Cannot find implementation or library stub for module named 'mypackage.utils.foo'
test.py:1: note: See https://mypy.readthedocs.io/en/latest/running_mypy.html#missing-imports
Found 1 error in 1 file (checked 1 source file)
```

What now? Every folder has an `__init__.py`, it's even installed as a pip package and the code runs, so we know that the module structure is right. What gives?

Well, turns out that **pip packages aren't type checked by mypy by default**. This behaviour exists because type definitions are opt-in by default. Python packages aren't expected to be type-checked, because mypy types are completely optional. If mypy were to assume every package has type hints, it would show possibly dozens of errors because a package doesn't have proper types, or used type hints for something else, etc.

To opt-in for type checking your package, you need to add an empty `py.typed` file into your package's root directory, and also include it as metadata in your `setup.py`:

```bash
$ tree ..
..
├── setup.py
├── src
│   └── mypackage
│       ├── __init__.py
│       ├── py.typed
│       └── utils
│           ├── foo.py
│           └── __init__.py
└── test
    └── test.py

4 directories, 6 files

$ cat ../setup.py
from setuptools import setup, find_packages

setup(
    name="mypackage",
    packages = find_packages(
        where = 'src',
    ),
    package_dir = {"":"src"},
    package_data={
        "mypackage": ["py.typed"],
    }
)

$ mypy test.py
Success: no issues found in 1 source file
```

There's yet another third pitfall that you might encounter sometimes, which is if `a.py` declares a class `MyClass`, and it imports stuff from a file `b.py` which requires to import `MyClass` from `a.py` for type-checking purposes.

This creates an import cycle, and Python gives you an `ImportError`. To avoid this, simple add an `if typing.TYPE_CHECKING:` block to the import statement in `b.py`, since it only needs `MyClass` for type checking. Also, everywhere you use `MyClass`, add quotes: `'MyClass'` so that Python is happy.

## Typing Context managers

Context managers are a way of adding common setup and teardown logic to parts of your code, things like opening and closing database connections, establishing a websocket, and so on. On the surface it might seem simple but it's a pretty extensive topic, and if you've never heard of it before, [Anthony covers it here](https://www.youtube.com/watch?v=ExdtNMnP24I).

To define a context manager, you need to provide two magic methods in your class, namely `__enter__` and `__exit__`. They're then called automatically at the start and end if your `with` block.

You might have used a context manager before: `with open(filename) as file:` - this uses a context manager underneath. Speaking of which, let's write our own implementation of `open`:

```python
from types import TracebackType
from typing import Any, Optional, IO, Type

class Open:
    def __init__(self, filename: str, mode: str = 'r'):
        self._name = filename
        self._mode = mode

    def __enter__(self) -> IO[Any]:
        self._file = open(self._name, self._mode)
        return self._file

    def __exit__(
            self,
            exception_type: Optional[Type[BaseException]],
            exception_instance: Optional[BaseException],
            exc_traceback: Optional[TracebackType],
    ) -> Optional[bool]:
        self._file.close()
        return None


with Open('test.txt', 'w') as f:
    f.write('Test')

with Open('test.txt') as f:
    print(f.read())  # Output: Test
```

## Typing async functions

The `typing` module has a duck type for all types that can be awaited: `Awaitable`.

Just like how a regular function is a `Callable`, an async function is a `Callable` that returns an `Awaitable`:

```python
import asyncio
from asyncio import Queue
from typing import Awaitable

queue: Queue[int] = Queue()

async def my_async_function() -> int:
    num = await queue.get()
    return num

def run_async(func: Awaitable[int]) -> None:
    loop = asyncio.get_event_loop()
    loop.run_until_complete(func)

reveal_type(my_async_function)  # Callable[[], Awaitable[int]]

run_async(my_async_function())
```

## Generics

Generics (or generic types) is a language feature that lets you "pass types inside other types".

I personally think it is best explained with an example:

Let's say you have a function that returns the first item in an array. To define this, we need this behaviour:

"Given a list of type `List[X]`, we will be returning an item of type `X`."

And that's exactly what generic types are: **defining your return type based on the input type**.

### Generic functions

We've seen `make_object` from the [Type type](#type-type) section before, but we had to use `Any` to be able to support returning any kind of object that got created by calling `cls(*args)`. But, we don't actually have to do that, because we can use generics. Here's how you'd do that:

```python
from typing import Any, Type, TypeVar

class MyClass:
    def __init__(self, x: int) -> None:
        self.x = x

    def __repr__(self) -> str:
        return f'C(x={self.x})'

T = TypeVar('T')
def make_object(cls: Type[T], *args: Any) -> T:
    print('making object of', cls)
    obj = cls(*args)
    return obj


c = make_object(MyClass, 42) # Making object of <class '__main__.MyClass'>

print(c)        # C(x=42)
print(c.x)      # 42

reveal_type(c)  # Revealed type is 'test.MyClass'
```

`T = TypeVar('T')` is how you declare a generic type in Python. What the function definition now says, is "If i give you a class that makes `T`'s, you'll be returning an object `T`".

And sure enough, the `reveal_type` on the bottom shows that mypy knows `c` is an object of `MyClass`.

> The generic type name `T` is another convention, you can call it anything.

Another example: `largest`, which returns the largest item in a list:

```python
from typing import Sequence, TypeVar

T = TypeVar('T')
def largest(items: Sequence[T]) -> T:
    if len(items) == 0:
        raise ValueError("Cannot get largest item in empty list")

    largest_item = items[0]
    for item in items:
        if item > largest_item:
            largest_item = item

    return largest_item

nums = [16, 3, 42, 7]
print(largest(nums))  # Output: 42
```

This seems good, but mypy isn't happy:

```bash
$ mypy --strict test.py
test.py:10: error: Unsupported left operand type for > ("T")
Found 1 error in 1 file (checked 1 source file)
```

This is because you need to ensure you can do `a < b` on the objects, to compare them with each other, which isn't always the case:

```python
>>> {} < {}
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: '<' not supported between instances of 'dict' and 'dict'
```

For this, we need a [Duck Type](#duck-types) that defines this "a less than b" behaviour.

And although currently Python doesn't have one such builtin hankfully, there's a "virtual module" that ships with mypy called `_typeshed`. It has a lot of extra duck types, along with other mypy-specific features.

```python
from typing import Sequence, TypeVar, TYPE_CHECKING

if TYPE_CHECKING:
    from _typeshed import SupportsLessThan

T = TypeVar('T', bound='SupportsLessThan')
def largest(items: Sequence[T]) -> T:
    if len(items) == 0:
        raise ValueError("Cannot get largest item in empty list")

    largest_item = items[0]
    for item in items:
        if item > largest_item:
            largest_item = item

    return largest_item

nums = [16, 3, 42, 7]
print(largest(nums))  # Output: 42
```

Now, mypy will only allow passing lists of objects to this function that can be compared to each other.

> If you're wondering why checking for `<` was enough while our code uses `>`, [that's how python does comparisons](https://docs.python.org/3/reference/datamodel.html#object.**lt**). I'm planning to write an article on this later.

Note that `_typeshed` is **not an actual module** in Python, so you'll have to import it by checking `if TYPE_CHECKING` to ensure python doesn't give a `ModuleNotFoundError`. And since `SupportsLessThan` won't be defined when Python runs, we had to use it as a string when passed to `TypeVar`.

> At this point you might be interested in how you could implement one of your own such `SupportsX` types. For that, we have another section below: [Protocols](#protocol).

### Generic classes

we implemented a simple Stack class in [typing classes](#typing-classes), but it only worked for integers. But we can very simply make it work for any type.

To do that, we need mypy to understand what `T` means inside the class. And for that, we need the class to extend `Generic[T]`, and then provide the concrete type to `Stack`:

```python
from typing import List, Generic, TypeVar

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._values: List[int] = []

    def __repr__(self) -> str:
        return f'Stack{self._values!r}'

    def push(self, value: int) -> None:
        self._values.append(value)

    def pop(self) -> int:
        if len(self._values) == 0:
            raise RuntimeError('Underflow!')

        return self._values.pop()

stack = Stack[int]()
print(stack)        # Stack[]

stack.push(2)
stack.push(10)
print(stack)        # Stack[2, 10]

print(stack.pop())  # 10
print(stack)        # Stack[2]
```

You can pass as many `TypeVar`s to `Generic[...]` as you need, for eg. to make a generic dictionary, you might use `class Dict(Generic[KT, VT]): ...`

### Generic types

Generic types (a.k.a. **Type Aliases**) allow you to put a commonly used type in a variable -- and then use that variable as if it were that type.

And mypy lets us do that very easily: with literally just an assignment. The generics parts of the type are automatically inferred.

```python
from typing import Dict, TypeVar, Union

T = TypeVar('T')
MyOptional = Union[T, None]

def get_unicorn(d: Dict[str, int]) -> MyOptional[int]:
    return d.get('unicorn')

d = {'x': 5}
unicorn = get_unicorn(d)

reveal_type(unicorn)  # Union[int, None]
print(unicorn)        # None
```

> There is an upcoming syntax that makes it clearer that we're defining a type alias: `Vector: TypeAlias = Tuple[int, int]`. This is available starting Python 3.10

Just like how we were able to tell the TypeVar `T` before to only support types that `SupportLessThan`, we can also do that

`AnyStr` is a builtin [restricted TypeVar](https://mypy.readthedocs.io/en/stable/generics.html?highlight=anystr#type-variables-with-value-restriction), used to define a unifying type for functions that accept `str` and `bytes`:

```python
from typing import TypeVar

AnyStr = TypeVar('AnyStr', str, bytes)

def concat(x: AnyStr, y: AnyStr) -> AnyStr:
    return x + y

concat('a', 'b')             # Ok
concat(b'a', b'b')           # Ok
concat(1, 2)                 # Error
concat('string', b'bytes')   # Error - different object types: str and bytes
```

This is different from `Union[str, bytes]`, because `AnyStr` represents **Any one of those two types at a time**, and thus doesn't `concat` doesn't accept the first arg as `str` and the second as `bytes`.

## Advanced/Recursive type checking with `Protocol`

We implemented `FakeFuncs` in the [duck types](#duck-types) section above, and we used `isinstance(FakeFuncs, Callable)` to verify that the object indeed, was recognized as a callable.

But what if we need to duck-type methods other than `__call__`?

If we want to do that with an entire class: That becomes harder. Say we want a "duck-typed class", that "has a get method that returns an int", and so on. We don't actually have access to the actual class for some reason, like maybe we're writing helper functions for an API library.

To do that, we need to define a `Protocol`:

```python
# api_library.py

class Api:
    def get(self, endpoint: str) -> int:
        status_code = 404
        return status_code
        # TODO: implement an actual API

    def is_connected(self) -> bool:
        return True
```

Using this, we were able to type check out code, without ever needing a completed `Api` implementaton.

This is _extremely powerful_. We're essentially defining the _structure_ of object we need, instead of what class it is from, or it inherits from. This gives us the flexibility of duck typing, but on the scale of an entire class.

Remember `SupportsLessThan`? if you check its implementation in `_typeshed`, this is it:

```python
from typing import Protocol

class SupportsLessThan(Protocol):
    def __lt__(self, __other: Any) -> bool: ...
```

Yeah, that's the entire implementaton.

What this also allows us to do is define **Recursive type definitions**. The simplest example would be a Tree:

```python
from typing import Generator, Optional, Protocol

class _Tree(Protocol):
    def __init__(
            self,
            data: int,
            left: Optional['_Tree'] = None,
            right: Optional['_Tree'] = None,
    ) -> None: ...

class Tree(_Tree):
    def __init__(
            self,
            data: int,
            left: Optional['Tree'] = None,
            right: Optional['Tree'] = None,
    ) -> None:
        self.data = data
        self.left = left
        self.right = right

    def __repr__(self) -> str:
        return f'Tree({self.data!r})'


tree = Tree(2, left=Tree(4), right=Tree(0))
print(tree)       # Tree(2)
print(tree.left)  # Tree(4)

def traverse_inorder(tree: Tree) -> Generator[int, None, None]:
    if tree.left:
        yield from traverse_inorder(tree.left)
    yield tree.data
    if tree.right:
        yield from traverse_inorder(tree.right)

for value in traverse_inorder(tree):
    print(value)

# Output:
# 4
# 2
# 0
```

> _Note that for this simple example, using Protocol wasn't necessary, as mypy is able to understand simple recursive structures. But for anything more complex than this, like an N-ary tree, you'll need to use Protocol._
> Structural subtyping and all of its features are defined extremely well in [PEP 544](https://www.python.org/dev/peps/pep-0544/).

## Further learning

If you're interested in reading even more about types, mypy has excellent [documentation](https://mypy.readthedocs.io/en/stable), and you should definitely read it for further learning, especially the section on [Generics](https://mypy.readthedocs.io/en/stable/generics.html).

I referenced a lot of [Anthony Sottile's](https://github.com/asottile) videos in this for topics out of reach of this article. He has a [YouTube channel](https://www.youtube.com/channel/UC46xhU1EH7aywEgvA9syS3w) where he posts short, and very informative videos about Python.

You can find the source code the typing module [here](https://github.com/python/cpython/blob/main/Lib/typing.py), of all the typing duck types inside the [\_collections_abc module](https://github.com/python/cpython/blob/main/Lib/_collections_abc.py), and of the extra ones in `_typeshed` in the [typeshed repo](https://github.com/python/typeshed/blob/master/stdlib/_typeshed/**init**.pyi).

A topic that I skipped over while talking about `TypeVar` and generics, is _Variance_. It's a topic in type theory that defines how subtypes and generics relate to each other. If you want to learn about it in depth, there's documentation in [mypy docs](https://mypy.readthedocs.io/en/stable/generics.html#variance-of-generic-types) of course, and there's two more blogs I found which help grasp the concept, [here](https://blog.daftcode.pl/covariance-contravariance-and-invariance-the-ultimate-python-guide-8fabc0c24278) and [here](https://blog.magrathealabs.com/pythons-covariance-and-contravariance-b422c63f57ac).

A bunch of this material was cross-checked using [Python's official documentation](https://docs.python.org/3), and honestly their docs are always great. Also, the "Quick search" feature works surprisingly well.

There's also quite a few typing PEPs you can read, starting with the kingpin: [PEP 484](https://www.python.org/dev/peps/pep-0484/), and the accompanying [PEP 526](https://www.python.org/dev/peps/pep-0526/). Other PEPs I've mentioned in the article above are [PEP 585](https://www.python.org/dev/peps/pep-0585/), [PEP 563](https://www.python.org/dev/peps/pep-0563/), [PEP 420](https://www.python.org/dev/peps/pep-0420/) and [PEP 544](https://www.python.org/dev/peps/pep-0544/).

---

And that's it!

I've worked pretty hard on this article, distilling down everything I've learned about mypy in the past year, into a single source of knowledge. If you have any doubts, thoughts, or suggestions, be sure to comment below and I'll get back to you.

Also, if you read the whole article till here, Thank you! And congratulations, you now know almost everything you'll need to be able to write fully typed Python code in the future. I hope you liked it ✨
