---
title: "Implementing @property, @staticmethod and @classmethod from scratch"
description: "The builtin method decorators... aren't actually decorators?"
publishDate: "Thursday, 17 March 2022"
author: "Tushar Sadhwani"
heroImage: "/images/descriptors.jpg"
alt: "Implementing @property, @staticmethod and @classmethod from scratch"
layout: "../../layouts/BlogPost.astro"
---

I recently saw this blog by [bas.codes][1] that explained decorators in Python,
and used `@property` and `@staticmethod` as examples. However, in reality those
aren't really decorators. So I wanted to make a continuation to it, by
explaining how these are really implemented.

## `@property`

`@property` allows us to create getter and setter functions for a property in
Python. Instead of defining a `get_x()` and `set_x()` method as you would in
other languages, Python lets you turn normal attribute access and assignment
into function calls:

```python
class C:
    def __init__(self):
        # Private data
        self._x = 42

    @property
    def x(self):
        print("Running getter")
        return self._x

    @x.setter
    def x(self, new_value):
        print("Running setter")
        self._x = new_value

c = C()
print(c.x)
c.x = 10
print(c.x)
```

This is the output:

```console
$ python property.py
Running getter
42
Running setter
Running getter
10
```

Simply accessing `c.x` and assigning it a new value runs the defined functions.
Isn't that neat?

So when we do:

```python
class C:
    @property
    def x(self):
        ...
```

The "decorator" part of it is the same. As in, you can also write this like so:

```python
class C:
    def x(self):
        ...

    x = property(x)
```

So we are still wrapping `x`, but `property(...)` doesn't return a function.
It returns a _descriptor_ object.

## So what's a descriptor

Once `x` has been wrapped with `@property`, `c.x` is no longer a normal value or
function that exists on the object. It has a really weird behaviour: When you
try to access `c.x`, a function is called. This function call is what gives
the value of `c.x`, not the `x` object itself.

Regular class objects don't behave like this at all. For example:

```python
def some_function():
    print("Running function")
    return 42

class C:
    x = some_function

c = C()
print(c.x)
```

```console
$ python property.py
<bound method some_function of <__main__.C object at 0x7f0713093b50>>
```

`c.x` is a function in this case, but you can see that simply accessing it
doesn't run it. That's how Python normally works.

To be able to turn attribute access into a function call, you need descriptors.
That's pretty much all that they do: turn attribute access and assignment into
function calls.

Let's see how they work with an example:

```python
class MagicNumberDescriptor:
    def __get__(self, obj, cls):
        return 42

class C:
    x = MagicNumberDescriptor()

c = C()
print(c.x)  # output: 42
```

When Python sees the `__get__` method in a class, it automatically turns its
objects into descriptors. Python has special hooks in place, where when you try
to access the descriptor, Python's runtime triggers `__get__` for you.

Yeah, the answer ends up being "black magic" in the end. But this little bit of
magic allows us to do a lot of cool things.

Similarly, attribute assignment calls the `__set__` method. With this we can
create a variable that behaves like our `property`:

```python
class ValueDescriptor:
    def __init__(self):
        self.value = 42

    def __get__(self, obj, cls):
        return self.value

    def __set__(self, obj, new_value):
        self.value = new_value

class C:
    x = ValueDescriptor()
    y = ValueDescriptor()

c = C()
print(c.x)  # 42
print(c.y)  # 42
c.x += 10
print(c.x)  # 52
print(c.y)  # 42
```

This is cool, but we are still far away from implementing `@property`, as:

- Currently, descriptor data is disjoint from object data. We can't access
  `self.value` from `c`, and so we can't make `self.value` affect other parts of
  the object. Unlike `@property`, where the underlying `self._x` value is still
  within the class and can be accessed by other methods.
- Right now, there's just one `__get__` and `__set__` method for all the
  descriptors that we define. If we want to customize the getter or setter
  function, like adding data validation, we need to create a new descriptor
  class everytime.

With these things in mind, let's implement a descriptor that is a lot more
flexible.

## Implementing `@property`

Let's start with implementing a `my_property` class, which works the same way as
`property`:

```python
class C:
    def __init__(self):
        self._x = 42

    @my_property
    def x(self):
        return self._x
```

We need `my_property` to be a descriptor class, because we're essentially doing
`x = my_property(x)` through the descriptor. This is what It looks like:

```python
class my_property:
    def __init__(self, getter_func):
        self.getter_func = getter_func

    def __get__(self, obj, cls):
        return self.getter_func(obj)

class C:
    def __init__(self) -> None:
        self._x = 42

    @my_property
    def x(self):
        return self._x
```

Here's how it works:

The decorator behaves like `x = my_property(x)`, so we're storing the original
`x` function in `self.getter_func`.

Then when `c.x` is accessed, we just call the getter function, and pass it
`obj`. `obj` is the object `c`, it's needed to be passed because that becomes
the first parameter `self`. (We'll see a little more about this soon!)

You might have noticed that `__get__` gets two parameters passed in by default,
`obj` and `cls`. They're the object that tried to access the descriptor, and its
class respectively. This goes to show how intertwined descriptors are with
classes: The `__get__` method doesn't ever get triggered if you make the
descriptor object outside of a class:

```python
>>> class D:
...     def __get__(self, o, c): return 42
...
>>> d = D()
>>> d
<__main__.D object at 0x7f2dde293460>
```

The "black magic" is only triggered when the descriptor is a class attribute.

Let's also implement the setter functionality, and make the setter a little more
interesting: Let's make it such that you can only increase the value of `x`:

```python
class my_property:
    def __init__(self, getter_func):
        self.getter_func = getter_func
        self.setter_func = None

    def __get__(self, obj, cls):
        return self.getter_func(obj)

    def setter(self, setter_func):
        self.setter_func = setter_func

    def __set__(self, obj, value):
        if self.setter_func is None:
            raise RuntimeError("This attribute cannot be set!")

        self.setter_func(obj, value)


class C:
    def __init__(self) -> None:
        self._x = 42

    @my_property
    def x(self):
        return self._x

    @x.setter
    def set_x(self, new_value):
        if new_value < self._x:
            raise ValueError("new value must be bigger than old one")

        self._x = new_value

c = C()
print(c.x)  # 42
c.x += 1
print(c.x)  # 43
```

The `@x.setter` decorator doesn't do anything special, it just stores the setter
function to be called in `__set__`.

There is one small issue, however, with this code:

```console
$ python -i property.py
42
43
>>> print(c.set_x)
None
```

With `@x.setter`, we're essentially doing `set_x = x.setter(set_x)`. And since
`setter` doesn't return anything, we now have a `set_x` defined on the class for
no reason.

To avoid this, Python mandates that the setter function has the same name as
the getter function. But if we try to do that:

```python
class C:
    def __init__(self) -> None:
        self._x = 42

    @my_property
    def x(self):
        return self._x

    @x.setter
    def x(self, new_value):
        if new_value < self._x:
            raise ValueError("new value must be bigger than old one")

        self._x = new_value
```

We have this problem:

```console
$ python -i property.py
>>> c = C()
>>> print(c.x)
None
```

Since `setter` doesn't return anything, now `c.x` has been set to `None`.

To work around this, Python actually creates a new descriptor object. So, we
replace the old `x` (which only had a getter function) with a new `x` (which has
both getter and setter functions). Like so:

```python
class my_property:
    def __init__(self, getter_func, setter_func=None):
        self.getter_func = getter_func
        self.setter_func = setter_func

    def __get__(self, obj, cls):
        return self.getter_func(obj)

    def setter(self, setter_func):
        return my_property(self.getter_func, setter_func)

    def __set__(self, obj, value):
        return self.setter_func(obj, value)


class C:
    def __init__(self) -> None:
        self._x = 42

    @my_property
    def x(self):
        return self._x

    @x.setter
    def x(self, new_value):
        if new_value < self._x:
            raise ValueError("new value must be bigger than old one")

        self._x = new_value
```

When `x.setter` is called, we store `setter_function` and return a new property
descriptor. That way `x` can now both get and set data.

## `@staticmethod`

`staticmethod` is comaratively simple: It just makes a class method which
doesn't require a `self` parameter.

This is actually fairly easy to implement as a regular decorator function too:

```python
def my_staticmethod(func):
    def wrapper(_):
        return func()

    return wrapper

class C:
    @my_staticmethod
    def foo():
        print("foo")

c = C()
c.foo()  # prints 'foo'
```

But regular staticmethods also let you access them directly from the class:

```python
class C:
    @staticmethod
    def foo():
        print("foo")

C.foo()  # foo
c.foo()  # foo
```

If we try to do that:

```console
$ python -i staticmethod.py
>>> C.foo()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: wrapper() missing 1 required positional argument: '_'
```

`c.foo()` is a shorthand for `C.foo(c)`, so if you just call `C.foo()`, there is
no first argument. So we need to make the `_` optional:

```python
def my_staticmethod(func):
    def wrapper(_=None):
        return func()

    return wrapper
```

To avoid having to do the `wrapper(_=None)` hack, we need to use descriptors.

Since we had to manually pass in the `self` parameter in our previous `__get__`
implementation, having no `self` is actually even easier for us. Like so:

```python
class my_staticmethod:
    def __init__(self, func):
        self.func = func

    def __get__(self, obj, cls):
        return self.func


class C:
    @my_staticmethod
    def foo():
        print("foo")
```

See? Really simple.

```console
>>> C.foo()
"foo"
>>> c = C()
>>> c.foo()
"foo"
```

## `@classmethod`

`classmethod` is similar, but instead of having no arguments, it gets the class:

```python
class C:
    @classmethod
    def foo(cls):
        print("Class name is:", cls.__name__)

c = C()
C.foo()  # Class name is: C
```

Since `__get__` already gets `cls` as its 3rd parameter, we just have to "bind"
that as the first argument of the function. We can either return a new lambda
function which calls `function(cls)`, or we can use `functools.partial`:

```python
from functools import partial

class my_classmethod:
    def __init__(self, func):
        self.func = func

    def __get__(self, obj, cls):
        return partial(self.func, cls)
        # or:
        # return lambda: self.func(cls)

class C:
    @my_classmethod
    def foo(cls):
        print("Class name is:", cls.__name__)

c = C()
C.foo()  # Class name is: C
```

## Extras: Methods are descriptors

Like in classmethod, if you put `obj` as the argument instead of `cls`, it makes
a regular method. That's actually how methods work in Python:

```python
from functools import partial

def print_name(self):
    print(self.name)

class Method:
    def __get__(self, obj, cls):
        return partial(print_name, obj)  # bind object as first argument

class User:
    def __init__(self):
        self.name = "User"

    print_name = Method()

user = User()
user.print_name()  # User
```

Python methods are descriptors internally, and that's where the first arg of
`self` gets passed in from. Now you know.

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
