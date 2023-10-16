---
title: "dunderhell - convert your Python code entirely into dunders"
description: "Nobody stopped me to question why, so it's kinda all your fault."
publishDate: "Tuesday, 10 October 2023"
author: "Tushar Sadhwani"
heroImage: "/images/dunderhell.jpg"
alt: "dunderhell - convert your Python code entirely into dunders"
layout: "../../layouts/BlogPost.astro"
---

So I saw this piece of code on a discord channel, completely out of context:

TODO: image

And this is what I had to say:

TODO: me saying not enough

I guess that means it's time to build a Python code transpiler that produces _only_ dunders.

> Trust me, this is not a shitpost, this will teach you something useful.
>
> Maybe.

---

So this is a piece of code:

```python
TODO
```

```console
TODO
```

And this is the same code, but made purely with dunders:

```python
TODO
```

```console
TODO
```

So, how.

# Try #1: The hacky, wrong, but fun way to do this

## first hurdle: strings ints and floats

- ints

The simplest way would be to produce zero and one, and create any number just by doing 1 + 1 + ...

So let's try that.

- How do we get 0

Maybe by calling `int()`?

Well to get to `int` is kidna hard.

`__len__` to the rescue: `__name__.__len__()` gives 8, and `__name__.__len__() - __name__.__len__()` gives zero and `__name__.__len__() // __name__.__len__()` gives 1.

So, you can build any positive number like this:

```python
def build_number(number):
    eight = '__name__.__len__()'

    if number == 0:
        return f'{eight} - {eight}'

    one = f'({eight} // {eight})'
    return ' + '.join([one] * number)
```

It does seem to generate correct code:

```python
>>> build_number(2)
'(__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__())'
>>> eval(build_number(2))
2
>>> four = f'{build_number(2)} + {build_number(2)}'
>>> four
'(__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__())'
>>> eval(four)
4
```

In fact, we can go a step further: `a + b` in Python is actually syntax sugar for `(a).__add__(b)`. Similarly `a // b` can be `(a).__floordiv__(b)`.

So, we can simply change `' + '.join(...)` with `'.__add__'.join(...)` and so on:

```python
def build_number(number):
    eight = '__name__.__len__()'

    if number == 0:
        return f'({eight}).__sub__({eight})'

    one = f'({eight}.__floordiv__({eight}))'
    return '.__add__'.join([one] * number)
```

It still works:

```python
>>> build_number(0)
'(__name__.__len__()).__sub__(__name__.__len__())'
>>> build_number(1)
'(__name__.__len__().__floordiv__(__name__.__len__()))'
>>> build_number(2)
'(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__()))'
>>> eval(build_number(1))
1
>>> eval(build_number(2))
2
```

For a bit larger numbers, it does work:

```python
>>> eval(build_number(5))
5
>>> eval(build_number(2000))
2000
```

But, it does get pretty slow. Especially because the number itself is huge.

```python
>>> len(build_number(100000))
4999992
```

But then, `eval()` fails with a recursion error as this is too many method calls in a single statement:

```python
>>> eval(build_number(100000))
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
RecursionError: maximum recursion depth exceeded during compilation
```

So we'll have to do better than that. And we can! There's a little trick to get very very large numbers very quickly, called _exponentiation_, or repeated multiplication.

We can change the algorithm to be as such:

- We already have 8 as a number so whenever the number is greater than 8 we can build it as `8 + N` instead
- If it is greater than 16 it can be `8 + 8 + N`,
- If greater than 64 then it can be made as `8*8 + ...`
- If greater than 512 as `8*8*8 + ...`

> Of course, instead of `+` and `*` we will do `.__add__` and `.__mul__`.

This would look something like this:

```python
import math

def build_number_under_8(number):
    eight = '__name__.__len__()'

    if number == 0:
        return f'{eight} - {eight}'

    one = f'({eight}.__floordiv__({eight}))'
    return '.__add__'.join([one] * number)

def build_number(number):
    if number < 8:
        return build_number_under_8(number)

    eight = '(__name__.__len__())'  # note that it is bracketed now
    number_parts = []
    remainder = number
    while remainder >= 8:
        log = int(math.log(remainder, 8))
        # wrap this in brackets to ensure __mul__ happens before __add__
        power_of_8 = '(' + '.__mul__'.join([eight] * log) + ')'
        number_parts.append(power_of_8)
        # we just created this power of 8, subtract to get remainder
        remainder -= 8 ** log

    # now remainder is under 8.
    if remainder > 0:
        number_parts.append(build_number_under_8(remainder))

    return '.__add__'.join(number_parts)
```

Let's see if it's more resonable now?

```python
>>> build_number(100000)
'((__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__()))'
>>> len(build_number(100000))
912
>>> eval(build_number(100000))
100000
```

Much better.

### Tying this up into a tool

I'll call this tool `dunderhell`, because it sounds appropriate.

Let's say you use it like this:

```console
$ cat foo.py
print(1)
$ dunderhell foo.py
print(__name__.__len__() // __name__.__len__())
```

So we can create our first alpha of `dunderhell.py` like so:

```python
import re
import sys

def build_number(number):
    ...  # the number implementation goes here


def replace_number_with_dunders(match):
    """Grabs the matched number and dunderifies it."""
    number = int(match.group())
    return build_number(number)


def main():
    filename = sys.argv[1]
    with open(filename) as file:
        contents = file.read()

    # for every match, `replace_number_with_dunders()` will be called
    # and the returned string will be substituted in the string
    new_code = re.sub(r'\d+', replace_number_with_dunders, contents)
    print(new_code)


if __name__ == '__main__':
    main()
```

And it works!

```console
$ cat foo.py
print(2 + 2)

$ python3 dunderhell.py foo.py
print((__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())) + (__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())))
```

Now before we move on, we need to address something.

### slight detour: why string substitution is not the best idea

TODO: what about numbers inside strings? or variable names? now your code got fucked.
So instead of using string replace, we will use AST replacement using `ast.NodeTransformer`.

# Try #2: Let's rewrite this logic as an AST transformer

TODO

## strings

this could be done in many ways:

My first thought was trying to get characters out of the `copyright` builtin:

```python
>>> __builtins__.__dir__()
['__name__', '__doc__', '__package__', ..., 'IOError', 'open', 'quit',
 'exit', 'copyright', 'credits', 'license', 'help', '_']
>>> __builtins__.__dir__()[-5]
'copyright'
>>> __builtins__.__dict__[__builtins__.__dir__()[-5]]
Copyright (c) 2001-2023 Python Software Foundation.
All Rights Reserved.

Copyright (c) 2000 BeOpen.com.
All Rights Reserved.

Copyright (c) 1995-2001 Corporation for National Research Initiatives.
All Rights Reserved.

Copyright (c) 1991-1995 Stichting Mathematisch Centrum, Amsterdam.
All Rights Reserved.
```

This does have a lot of characters, but sadly we can't use any of this as `copyright` is not a string. It is a `_Printer` object:

```python
>>> __builtins__.__dict__[__builtins__.__dir__()[-5]].__class__
<class '_sitebuiltins._Printer'>
>>> __builtins__.__dict__[__builtins__.__dir__()[-5]][0]
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: '_Printer' object is not subscriptable
```

We can't use indexing to get characters out of its string. We'll have to find another way.

How about using the `string` module?

```python
>>> import string
>>> string.ascii_lowercase
'abcdefghijklmnopqrstuvwxyz'
>>> string.ascii_lowercase[0]
'a'
>>> string.ascii_lowercase[19]
't'
```

Well too bad `ascii_lowercase` isn't a dunder, and this won't help us with unicodes in strings anyway.

### `chr` to the rescue

New plan: Use `chr()`

Say we wanted to print the Zen of Python:

```python
import this
```

This can be written as:

```python
__import__('this')
```

which can be written as

```python
__import__('t' + 'h' + 'i' + 's')
```

which can be written as

```python
__import__(chr(116) + chr(104) + chr(105) + chr(115))
```

_That does in fact work:_

```python
>>> __import__(chr(116) + chr(104) + chr(105) + chr(115))
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
...
```

But we run into a problem: how do we get `chr` with a dunder?

Thankfully, if all we have to build is `chr`, we can build it from other existing strings.

`'c'` can be picked up from the `__reduce__` method on strings. Thankfully all functions have a `__name__` containing their name as a string:

```python
>>> __name__
'__main__'
>>> __name__.__reduce__
<built-in method __reduce__ of str object at 0x100f950f0>
>>> __name__.__reduce__.__name__
'__reduce__'
>>> __name__.__reduce__.__name__[6]
'c'
```

`'h'` can be picked up from any method's `__class__` i.e. `method-wrapper`:

```python
>>> __name__.__add__
<method-wrapper '__add__' of str object at 0x100f950f0>
>>> __name__.__add__.__class__
<class 'method-wrapper'>
>>> __name__.__add__.__class__.__name__
'method-wrapper'
>>> __name__.__add__.__class__.__name__[3]
'h'
```

And `'r'` can be picked from the `str` class here:

```python
>>> __name__
'__main__'
>>> __name__.__class__
<class 'str'>
>>> __name__.__class__.__name__[-1]
'r'

# In the end it'll look like this
>>> __name__.__class__.__name__[-(__name__.__len__() // __name__.__len__())]
'r'
```

> Of course, there can be a hundred other ways, e.g. Using the `__loader__` class' name.

Now we have `'c'`, `'h'`, and `'r'`. Joining them, we can create the string `'chr'`. And then, we can grab the `chr()` functions from the builtins by doing `__builtins__.__getattribute__('chr')` :D

So, this means our dunder-ification process looks something like this:

```python
__import__('this')
```

Turn string into a bunch of `chr` calls:

```python
__import__(chr(116) + chr(104) + chr(105) + chr(115))
```

Replace `chr` with the getattribute. I'll take the liberty to create a `__chr__` variable instead of inserting that whole part everywhere:

```python
__chr__ = __builtins__.__getattribute__('chr')
__import__(__chr__(116) + __chr__(104) + __chr__(105) + __chr__(115))
```

And make sure to change the `'chr'` string to the abomination we created:

```python
__chr__ = __builtins__.__getattribute__(__name__.__reduce__.__name__[6] + __name__.__add__.__class__.__name__[3] + __name__.__class__.__name__[-1])

__import__(__chr__(116) + __chr__(104) + __chr__(105) + __chr__(115))
```

Now we change all numbers to use the `__len__` trick:

```python
__chr__ = __builtins__.__getattribute__(__name__.__reduce__.__name__[(__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__())] + __name__.__add__.__class__.__name__[(__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__())] + __name__.__class__.__name__[-(__name__.__len__() // __name__.__len__())])

__import__(__chr__((__name__.__len__())*(__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__())) + __chr__((__name__.__len__())*(__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__())) + __chr__((__name__.__len__())*(__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__() // __name__.__len__())) + __chr__((__name__.__len__())*(__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__()) + (__name__.__len__() // __name__.__len__())))
```

And of course, at the end, The operators get changed to `.__add__` and so on:

```python
__chr__ = __builtins__.__getattribute__(__name__.__reduce__.__name__[(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__()))] + __name__.__add__.__class__.__name__[(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__()))] + __name__.__class__.__name__[-(__name__.__len__().__floordiv__(__name__.__len__()))])

__import__(__chr__(((__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__()))) + __chr__(((__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__()))) + __chr__(((__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__()))) + __chr__(((__name__.__len__()).__mul__(__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__((__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__())).__add__(__name__.__len__().__floordiv__(__name__.__len__()))))
```

It's beautiful.

And of course, it runs. Let's save this final version as `abomination.py`:

```console
$ python3 abomination.py
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
...
```

## Putting this in `dunderhell`

Nothing special really has to be done here; we just have to create more visitors:

- `StringVisitor` takes in strings and produces these `chr(N) + chr(M)` stuff
- `ChrVisitor` converts every `chr` into `__builtins__.__getattribute__(__name__.__reduce__.__name__[6] + ...)`
- Then our existing `NumberVisitor` which will convert the indexes like `-1` into `-(__name__.__len__()).__floordiv__(__name__.__len__())` etc.

If we run the Visitors in that order, even though `StringVisitor` produces `chr` calls and `ChrStringVisitor` produces numbers, at the end, _the entire code_ will have become dunders.

So let's do that:

TODO
