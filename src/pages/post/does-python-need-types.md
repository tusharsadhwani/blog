---
title: "Does Python need types?"
description: "Python is famously a dynamic language, and many attribute its success to its dynamically typed nature. But is that really all there is to it?"
publishDate: "Wednesday, 28 April 2021"
author: "Tushar Sadhwani"
heroImage: "/images/python-types.jpg"
alt: "Does Python need types?"
layout: "../../layouts/BlogPost.astro"
---

I'm a huge fan of Python. It's by far the simplest general purpose language, that you can just pick up and start building amazing things with.

But for the past year or so, I've been working on frontend projects, and I've really enjoyed using [Typescript](https://www.typescriptlang.org). It's essentially JavaScript, but with fancy features built on top of it like _Static Type checking_ and _Null safety_, and it was _awesome_ how much it helped in writing robust, bug free code.

So I went out to find if Python has such an equivalent, and sure enough, there was.

It's called [mypy](https://mypy-lang.org), and it is amazing. It works so well in-fact, that I can never go back to writing plain Python now — and this article will be your introduction to it.

**But before all that**, let's figure out what's the deal with _Types_.

## Why types?

What it essentially means is if you have a type system, **every variable has a pre-decided type associated with it**.

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fdmzm8gner72499j5i3h.png)

<figcaption>Untyped vs. typed Python code</figcaption>

> Note that, while this might not look like it, the typed version is perfectly valid Python code.

---

What it also means, is you can't pass values of the wrong type anywhere. The type checker doesn't let you.

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cgam11h9xoxqyhizstw2.png)

Which is extremely valuable if you think about it - I've lost count how many `TypeError`'s I've seen in Python over the years!

Just having the confidence that there's no such place in your code where accidentally passed a `str` where an `int` was expected, eliminates an entire class of bugs from your codebase.

---

Not only that - you get a bunch of other benefits, namely:

- Self-documenting code
- `None`-awareness
- Better autocompletion and IDE support

I'll go over all these points in detail.

### Self-documenting code

Imagine you have this piece of code:

```python
def add_orders(self, orders):
    for order in orders:
        self.pending_ids.add(order.id)
```

Seems rather simple, doesn't it? We seem to have a list of `order`'s, and we add each order's id to a set called `pending_ids`.

But what are `order`'s here...

It's hard to tell. In a large codebase, you might have to search pretty hard to find out which part of the code is calling `add_orders`, and where the data in that is coming from, to eventually find out that it's supposed to be just a `namedtuple`.

How about this instead:

```python
from models import Order

def add_orders(self, orders: list[Order]) -> None:
    for order in orders:
        self.pending_ids.add(order.id)
```

Now it's instantly clear, that everywhere `add_orders` is used, it's going to be exactly of that type.

### `None`-awareness

What I mean by this, is that not only can you not pass wrong types of values around, you also can't pass values that could be `None`, to places that don't expect the value to be possibly `None`.

Here's an example:

```python
User = namedtuple('User', ['name', 'favorites'])

def fetch_users():
    users = []
    for _ in range(3):
        user_dict = get_user_from_api()
        user = User(
            name=user_dict.get('name', 'Anonymous'),
            favorites=user_dict.get('favorites')
        )
        users.append(user)

    return users

def print_favorite_colors(users):
    for user in users:
        print(user.favorites.get('color'))

users = fetch_users()
print_favorite_colors(users)
```

... and on first glance, this looks fine. We're using `.get` so we shouldn't get a `KeyError` anywhere, so we should be fine, right?

Now here's the typed version of the same code:

```python
class User(NamedTuple):
    name: str
    favorites: Optional[dict[str, str]]

def fetch_users() -> list[User]:
    users = []
    for _ in range(3):
        user_dict = get_user_from_api()
        user = User(
            name=user_dict.get('name', 'Anonymous'),
            favorites=user_dict.get('favorites')
        )
        users.append(user)

    return users


def print_favorite_colors(users: list[User]) -> None:
    for user in users:
        print(user.favorites.get('color'))


users = fetch_users()
print_favorite_colors(users)
```

And as soon as you add types, you see one error:

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fcmm87dc0gdnwr7k45j1.png)

You forgot that `user.favorites` could be None, which would crash your entire application.

Good thing mypy caught it before your clients did.

### Better autocompletion and IDE support

This is honestly my favorite part of working with typed Python. The amount of autocompletion static types give me is awesome, and it increases my productivity ten-fold, because I rarely have to open the documentation anymore.

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/af50k2xhu0n7oz5w3f83.png)

## Where can I use it?

Now I can hear you saying, "All of this sounds very cool. But where can I use this mypy-thing in my Python codebase?"

And turns out, **you can start gradually adding types to your existing Python codebase**, one function and one class at a time. It will infer as much information as it can from the amount of type information it has, and will reduce your bugs no matter how small you start.

---

## Conclusion

So, this was my introduction to you, to the world of static type checking in Python. Are you interested in learning more about it? I'll be dropping a detailed guide to mypy very soon, so stay tuned.

> UPDATE: [It's out!](./mypy-guide)

I'd also love to hear your thoughs on this article, so let me know what you think about mypy down in the comments.
