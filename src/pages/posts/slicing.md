---
title: "The math behind Python's slices"
description: "You can pass negative indices to Python slices?! Learn about them and a lot more in this guide."
publishDate: "Wednesday, 18 August 2021"
author: "Tushar Sadhwani"
# heroImage:
alt: "The math behind Python's slices"
layout: "../../layouts/BlogPost.astro"
---

## The basics

Let's get the basics out of the way first:

The simplest form of a slice only considers the first two parts, a `start` index and an `end` index. Not providing either the start or the end will result in you getting all the numbers from the beginning and/or the end.

Like so:

```python
>>> nums = [1, 2, 3, 4, 5, 6]
>>> nums[1:3]
[2, 3]
>>> nums[:3]
[1, 2, 3]
>>> nums[3:]
[4, 5, 6]
```

> Note that the `end` index, when provided, is never included in the result

And just for completion's sake, if you don't provide either, it just clones the entire list:

```python
>>> nums[:]
[1, 2, 3, 4, 5, 6]
```

Apart from these, there's also a third argument: `step`, which tells how many numbers it should increment its index by, to get to the next element. `step` is 1 by default.

```python
>>> nums = [1, 2, 3, 4, 5, 6]
>>> nums[::1]
[1, 2, 3, 4, 5, 6]
>>> nums[::2]
[1, 3, 5]
>>> nums[::4]
[1, 5]
```

## The interesting bits

You can imagine the slicing algorithm being used by the interpreter to be as following:

```python
def slice(array, start, stop, step):
  result = []
  index = start
  while index < end:
      result.append(array[start])
      index += step

  return result
```

This explains the behaviour of `end` never being included, and how `step` decides how to pick the next value.

**But,** how about this:

```python
>>> nums[:-1]
[1, 2, 3, 4, 5]
>>> nums[:-3]
[1, 2, 3]
>>> nums[-3:-1]
[4, 5]
>>> nums[-1:-3:-1]
[6, 5]
>>> nums[-1:-3]
[]
```

What's going on in here?

## Negative numbers in slices

It should be common knowledge that you can provide negative **indices** in Python to get a number from the end:

```python
TODO
```

TODO:

- Same thing happens in slicing
- Once you know this, it's simple math.
- TODO: write the necessary code for negative to positive index conversion

## Negative `step`

The second important fact about slices: When `step` is negative, the condition that's used to determine whether to take the next element or not is **flipped around**.

It makes intuitive sense if you think about it for a moment, if we are checking `while start < end` while also decrementing `start` at every step, we will never reach the point where the condition becomes false. So we _need_ to flip the condition around to `while start > end`, in order for slicing to still work.

That explains why `nums[-1:-3:-1]` returns `[6, 5]`, it's because it starts with the last index, and keeps going until it's decremented till the 3rd last index (which is excluded).

If you want an updated Python code that factors this in, here it is:

```python
TODO
```

> But what about `nums[-1:-3]` returning an empty list?

Well that's easy. Since -1 points to the end of the array, and step is 1 (positive), therefore `start < end` is `False` from the get go, and the result just stays empty.

## Summary

Hopefully it is evident that Python's slices are rather straightforward, once you understand a couple basic concepts about how they function.
