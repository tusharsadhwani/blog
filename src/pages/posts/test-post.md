---
title: "Test post"
description: "This is a test."
publishDate: "Tuesday, July 30 2021"
author: "Tushar"
heroImage: "/social.jpg"
alt: "Test"
layout: "../../layouts/BlogPost.astro"
---

## This is a heading

---

Seems to be working

```python
from functools import wraps
def bang(func):
    @wraps(func)
    def inner(*args, **kwargs):
        string = func(*args, **kwargs)
        return string + '!'

    return inner

@bang
def greet(name):
    return f'Hello, {name}'

print(greet('Tushar'))
```
