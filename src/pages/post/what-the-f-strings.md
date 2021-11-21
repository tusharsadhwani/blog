---
title: "What the f-strings?"
description: "A comprehensive overview of Python's hottest new feature: f-strings."
publishDate: "Wednesday, July 7 2021"
author: "Tushar Sadhwani"
heroImage: "/images/f-strings.jpg"
alt: "What the f-strings?"
layout: "../../layouts/BlogPost.astro"
---

So a couple months ago, I wrote a [comprehensive blog on mypy](../mypy-guide). Today I'm planning to do the same with f-strings, putting everything I know about them into a single source of knowledge. It's an awesome Python feature, and I hope you'll get to learn something new about it ✨

## Index

- [Index](#index)
- [What is an f-string?](#what-is-an-f-string)
- [Simple examples](#simple-examples)
- [A brief history of string formatting](#a-brief-history-of-string-formatting)
- [Why f-strings?](#why-f-strings)
- [More Examples](#more-examples)
  - [Padding / truncating](#padding--truncating)
  - [Alignment](#alignment)
  - [Rounding numbers](#rounding-numbers)
  - [Converting types](#converting-types)
  - [Adding commas to large numbers](#adding-commas-to-large-numbers)
- [Special syntax](#special-syntax)
  - [!s !r and !a](#s-r-and-a)
  - [`datetime` formatting](#datetime-formatting)
  - [`{x=}` syntax](#x-syntax)
- [Nested formatting](#nested-formatting)
- [Custom formatting using `__format__`](#custom-formatting-using-__format__)
- [Limitations](#limitations)
- [Conclusion](#conclusion)

## What is an f-string?

"f-strings" are a feature added to Python in version 3.6, and it's essentially a new, more concise way to embed values inside strings.

They're called f-strings because of the syntax: you put an `f` before the string literal, like so:

```python
string = f'this is an f-string'
```

## Simple examples

Here's a few basic examples on how to use f-strings to get you started:

```python
>>> name, birth_year = 'Tushar', 2000
>>> print(f'I am {name}, and I was born in {birth_year}')
I am Tushar, and I was born in 2000
>>> import datetime; now = datetime.datetime.now()
>>> print(f'I am {now.year - birth_year} years old')
I am 21 years old
>>> age = now.year - birth_year
>>> print(f'I am {"an adult" if age >= 18 else "a child"}.')
I am an adult.
>>>
```

## A brief history of string formatting

String formatting in Python dates back a long time. The original formatting using the `%` sign has existed in Python ever since version 1.x (and even before that in C, which is where this feature's inspiration comes from). It allowed you to do most string formatting very easily, even though the syntax was a bit unusual: it uses `%` flags in your string, which get replaced by the values you pass in. Here's an example:

```python
>>> city = 'London'
>>> print('She lives in %s since %d' % (city, 2000))
She lives in London since 2000
>>>
```

There's a bunch of these `%` patterns, and each of them has a meaning:

- `%s` - String
- `%c` - Character (ASCII/Unicode)
- `%d` - Digits (Integer)
- `%f` - Floats
- `%x` - Hexadecimal number, etc.

Each of these can be modified with more information, like padding and alignment, for example:

- `%9s` means a string of length 9.
- `%-7d` means an integer of length 7, but **left-aligned**.

```python
>>> print('%15f seconds' % 31.415926)
      31.415926 seconds
>>> print('%-15f seconds' % 31.415926)
31.415926       seconds
>>>
```

Eventually, people realised that the `%` syntax borrowed from C might not be the most readable way to format strings. So in Python 3.0 (alongside 2.6), A new method was added to the `str` data type: `str.format`. Not only was it more obvious in what it was doing, it added a bunch of new features, like dynamic data types, center alignment, index-based formatting, and specifying padding characters. Here's a few examples:

```python
>>> month = 'May'
>>> print('I was born in {}.'.format(month))
I was born in May
>>> blog_title = 'What the f-string?'
>>> print('{title:-^30}'.format(title=blog_title))
------What the f-string?------
>>> print('{:_<15f} seconds'.format(31.415926))
31.415926______ seconds
>>> print('{:>15f} seconds'.format(31.415926))
      31.415926 seconds
```

> Note that if you don't specify an alignment character using `<`, `>` or `^`, it will _always_ default to left alignment. This is different from `%`-formatting, as that defaults to right-alignment for numbers.

Along with `str.format` method, there's also a built-in `format` function which does the same thing.

> For a lot more information about `%`-formatting and `str.format`, and all of their (many) features, head to [pyformat.info](https://pyformat.info). It is very useful as a reference for the features and syntax.

## Why f-strings?

One thing that you should know is that `str.format()` can already do _(almost)_ everything that f-strings can do. You might be wondering then, "why were f-strings created in the firt place? And why should _I_ care about them?"

Well, it's for two reasons:

- it's **way more intuitive**, and
- it's **way more readable**.

Here's a comparision:

```python
>>> name, age = 'Mark', 31
>>> # str.format version
>>> print('Hi, I'm {0} and I'm {1} years old.'.format(name, age)
Hi, I'm Mark and I'm 31 years old.
>>> # f-string version
>>> print(f'Hi, I'm {name} and I'm {age} years old.')
Hi, I'm Mark and I'm 31 years old.
```

These two properties, of being intuitive and readable, are part of the core philisophy of Python (refer [The Zen of Python](https://www.python.org/dev/peps/pep-0020/)).

## More Examples

Now, a few examples on everything that you can do with f-strings.

### Padding / truncating

```python
>>> pi = 3.141592
>>> print(f'{pi}')
3.141592
>>> print(f'{pi:10}')     # padding to make length 10
  3.141592
>>> print(f'{pi:010}')    # padding with zeroes
003.141592
>>> print(f'{pi:.3}')     # 3 digits total, ignoring decimal
3.14
>>> string = "Hello! this is a string"
>>> print(f'{string:.6}')  # 6 characters
'Hello!'
```

### Alignment

```python
>>> heading = 'Test'
>>> print(f'{heading:>20}')
                Test
>>> print(f'{heading:~>20}')  # specify alignment for custom padding
~~~~~~~~~~~~~~~~Test
>>> print(f'{heading:_<20}')
Test________________
>>> print(f'{heading:=^20}')
========Test========
>>>
```

### Rounding numbers

```python
>>> num = 2.136
>>> print(f'{num}')
2.136
>>> print(f'{num:.3}')  # Rounded up
2.14
>>> print(f'{num:.2}')  # Rounded down
2.1
>>>
```

### Converting types

```python
>>> print(f'{42:c}')       # int to ascii
*
>>> print(f'{604:f}')      # int to float
604.000000
>>> print(f'{84:.2f}%')
84.00%
>>> print(f'{604:x}')      # int to hex
25c
>>> print(f'{604:b}')      # int to binary
1001011100
>>> print(f'{604:0>16b}')  # int to binary, with zero-padding
0000001001011100
>>>
```

### Adding commas to large numbers

```python
>>> large_num = 12_345_678  # int syntax supports underscores :D
>>> print(f'{large_num}')
12345678
>>> print(f'{large_num:,}')
12,345,678
```

## Special syntax

There's a few special set of syntaxes that don't exist in the original `%`-formatting:

### !s !r and !a

```python
>>> from datetime import datetime
>>> datetime.now()                # repr value
datetime.datetime(2021, 7, 6, 2, 21, 56, 698285)
>>> print(datetime.now())         # str value
2021-07-06 02:22:02.772826
>>> print(f'{datetime.now()}')    # str value by default
2021-07-06 02:22:14.357562
>>> print(f'{datetime.now()!r}')  # repr value
datetime.datetime(2021, 7, 6, 2, 22, 17, 709937)
>>> print(f'{datetime.now()!s}')  # str value
2021-07-06 02:22:20.081837
>>> sparkles = '✨'
>>> print(f'{sparkles}')
✨
>>> print(f'{sparkles!a}')        # ascii-safe value
'\u2728'
```

### `datetime` formatting

```python
>>> from datetime import datetime
>>> print(f'{datetime.now():%A, %B %d %Y}')
Tuesday, July 06 2021
```

> For more info on the `%` codes specifically for datetime objects, check out the documentation for `datetime.strftime`, or check out [strftime.org](https://strftime.org).

### `{x=}` syntax

This is a new syntax that was added to Python 3.8, and it helps you quickly print out a variable's value, usually for debugging purposes. Essentially, `f'{abc=}'` is the same as `f'abc={abc!r}'`.

```python
>>> x, y = 3, 5
>>> print(f'{x=}')
x=3
>>> print(f'{x = }')
x = 3
>>> x, y = y, x+y
>>> print(f'{x=} {y=}')
x=5 y=8
>>> string = 'test'.center(10, '*')
>>> print(f'{string = }')
string = '***test***'
>>> print(f'{10 * 2 = }')
10 * 2 = 20
>>>
```

## Nested formatting

Since we can sometimes have rather complicated format specifications, like `~^30s` or `0>12,.2f`, it makes sense to be able to extract those out into variables as well. And that's exactly what **nested formatting** lets us do.

Some things that you can do with

- Variable length padding

```python
>>> string = 'Python'
>>> size = 20
>>> print(f'{string:{size}}')
~~~~~~~Python~~~~~~~
>>>
```

- putting in the format spec as a variable, or as multiple variables:

```python
from math import pi

digits = int(input('Enter number of digits of pi: '))
length = int(input('Enter string length: '))
alignment = input('Enter alignment (<, > or ^): ')
padding_char = input('Enter padding character: ')
print(f'{pi:{padding_char}{alignment}{length}.{digits}}')
```

Output:

```plaintext
Enter number of digits of pi: 8
Enter string length: 30
Enter alignment (<, > or ^): ^
Enter padding character: _
__________3.1415927___________
```

## Custom formatting using `__format__`

You can define custom format handling in your own objects by overriding the `__format__` method on the formatter object. This allows you to define (mostly) arbitrary formatting semantics.

Here's an example, with more sensible names for datetime formatting:

```python
from datetime import datetime

class BetterDatetime(datetime):
    substitutions = {
        '%day': '%A',
        '%date': '%d',
        '%monthname': '%B',
        '%month': '%m',
        '%year': '%Y'
    }

    def __format__(self, format_spec):
        for token, replacement in self.substitutions.items():
            format_spec = format_spec.replace(token, replacement)

        return super().__format__(format_spec)

print(f'Today is {BetterDatetime.now():%day, %date %monthname %year}')

# Output: Today is Monday, 8 July 2021
```

## Limitations

As amazing as f-strings are, they're not the be-all and end-all of string formatting in Python. _(but they come very close!)_

Some nitpicks from my side about f-strings are:

- You can't separate the string template from the data being embedded. In str.format, you can store the strings themselves as templates in a separate file, like `text = '{user} has left'`. Then, you can import `text` and use `text.format(user=...)`. You can't do this with f-strings.

- f-strings only work in Python 3.6+, and `{x=}` syntax only works in Python 3.8+

- There's also no real replacement for the `str.format_map` method using f-strings.

## Conclusion

All in all, f-strings are awesome, and everyone should use them :P

Anywho, if you have any questions or suggestions, drop them below. I'd love to hear from you ✨
