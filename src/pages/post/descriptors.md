---
title: "Implementing @property, @staticmethod and @classmethod from scratch"
description: "TODO"
publishDate: "Thursday, 17 March 2002"
author: "Tushar Sadhwani"
heroImage: "/images/TODO.jpg"
alt: "Implementing @property, @staticmethod and @classmethod from scratch"
layout: "../../layouts/BlogPost.astro"
---

I recently saw this blog by [bas.codes][1] that explained decorators in Python,
and used `@property` and `@staticmethod` as examples. However, in reality those
aren't really decorators. So I wanted to make a continuation to it, by
explaining how these are really implemented.

## `@property`

So when we do:

```python
@property
def x(self):
    ...
```

It's still the same as defining a function `x` and then doing `x = property(x)`,
so we are still wrapping `x`, but `property(...)` doesn't return a function.
It returns a _descriptor_ object.

## So what's a descriptor

Also, instance attributes can shadow descriptors, as they're defined on the
class.

## `@staticmethod`

We need to use descriptors to avoid having to do the `wrapper(_=None)` hack.

## `@classmethod`

## Extras: Methods are descriptors

Like in classmethod, if you put `obj` as the argument instead of `cls`, it
creates a method. That's how methods work in Python, and that's where the first
arg of `self` comes from when you do `obj.method()`:

TODO: example of `obj.method()` and equivalent descriptor implementation

## Appendix

There's a few things missing with the implementations above, like the `deleter`
attribute in properties, type annotations, preserving function names and
docstrings, and the like. I'll be leaving those for you to figure out yourself.
Here's some resources if you need help with those:

- [functools.wraps][2]
- [mypy guide][3]

And that's it. Hopefully this helped you understand descriptors and why you'd
want to use them. There's some very interesting uses of descriptors outside of
these three, and hopefully if you encounter such a situation, you'll remember
this feature and be able to use it.

[1]: https://bas.codes/posts/python-decorators
[2]: https://docs.python.org/3/library/functools.html#functools.wraps
[3]: https://sadh.life/post/mypy-guide
