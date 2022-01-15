---
title: "Lazy recursion, with generators"
description: "Name a better pairing, I'll wait."
publishDate: "Saturday, 15 January 2022"
author: "Tushar Sadhwani"
heroImage: "/images/recursive-generators.jpg"
alt: "Lazy recursion, with generators"
layout: "../../layouts/BlogPost.astro"
---

In this (relatively short) article, we will look at Python's generators, and use them to improve the memory usage of recursive code.

## When the code calls itself

You know what recursion is. Function call itself, recursion go brr. If you need a refresher let's see a quick example:

```python
def factorial(n):
    # base case
    if n == 1:
        return 1

    # recurse
    return n * factorial(n-1)
```

To understand how calling itself works, here's what factorial(5) turns into:

```text
factorial(5)
= 5 * factorial(4)
= 5 * 4 * factorial(3)
= 5 * 4 * 3 * factorial(2)
= 5 * 4 * 3 * 2 * factorial(1)
= 5 * 4 * 3 * 2 * 1
= 120
```

The value of `1` comes out of `factorial(1)`, which gets multiplied by 2, 3 and so on as it travels back up the call stack.

## Why bother?

The above recursive code can be written as a for loop instead:

```python
def factorial(n):
    product = 1
    for i in range(2, n+1):
        product = product * i

    return product
```

Then why should you bother writing recursive code?

The truth is that some logic is inherently recursive. A good example is printing out all the paths inside a folder, like what the `find` command does. Here's the source code for one of my projects:

```bash
$ find ./src
./src
./src/pylox
./src/pylox/tokens.py
./src/pylox/utils
./src/pylox/utils/__init__.py
./src/pylox/utils/visitor.py
./src/pylox/utils/ast_printer.py
./src/pylox/__init__.py
./src/pylox/lexer.py
./src/pylox/__main__.py
./src/pylox/expr.py
./src/pylox/py.typed
./src/pylox/parser.py
```

And its workings are fairly simple. Here's how you print all contents of a folder:

- Print the folder's path
- Get all the things immediately inside the folder.
- For every item in the folder:
  - If it is a file, just print the file's path.
  - If it is a folder, print out all contents of this sub-folder.

Note that the last instruction (print all contents of the sub-folder) is just a smaller subset of the original task. Recursion is a natural fit for tasks like these.

## Time to code

Let's put those instructions into working code. We will use a fake file structure to run it.

Let's simulate the following tree structure:

```bash
$ tree /
/
├── etc
│   ├── passwd
│   └── shadow
└── usr
    ├── bin
    │   ├── cat
    │   └── ls
    └── lib
        ├── my_lib
        └── gcc
            └── x86_64-linux-gnu
```

```python
file_tree = ['', [
    ['etc', ['passwd', 'shadow']],
    ['usr', [
        ['bin', ['cat', 'ls']],
        ['lib', [
            'my_lib',
            ['gcc', ['x86_64-linux-gnu']]
        ]]
    ]]
]]


def print_paths_recursive(folder, path=()):
    name, contents = folder
    path = (*path, name)

    print('/'.join(path))

    for item in contents:
        if isinstance(item, str):
            # This is a file, print out its path
            print('/'.join((*path, item)))
        else:
            # This is a folder, recurse
            print_paths_recursive(item, path)

print_paths_recursive(file_tree)
```

And the output:

```bash
$ python find.py

/etc
/etc/passwd
/etc/shadow
/usr
/usr/bin
/usr/bin/cat
/usr/bin/ls
/usr/lib
/usr/lib/my_lib
/usr/lib/gcc
/usr/lib/gcc/x86_64-linux-gnu
```

Fairly straightforward.

Now comes the twist: What would you do to make this function return all the paths instead?

## Recursion and collection

It's very common to have to write recursive code that collects some data along the way. Having to collect all the file paths instead of printing them out is an obvious example.

We need to make fairly minor changes to do that:

- The function will now return a list of paths. This is an important distinction to make for recursion, as the function didn't return anything before.
- Instead of printing out stuff, we will `append` to the list of paths instead.
- Instead of just doing a recursive call, we will receive the sub-paths as the return value, and `append` them to the final answer as well.

Here's the changed code:

```python
def get_paths_recursive(folder, path=()):
    paths = []

    name, contents = folder
    path = (*path, name)

    paths.append('/'.join(path))

    for item in contents:
        if isinstance(item, str):
            # This is a file, append its path
            paths.append('/'.join((*path, item)))
        else:
            # This is a folder, recurse and append all subpaths
            for subpath in get_paths_recursive(item, path):
                paths.append(subpath)

    return paths

paths = get_paths_recursive(file_tree)
print(paths)
```

The output:

```bash
$ python find.py

['', '/etc', '/etc/passwd', '/etc/shadow', '/usr', '/usr/bin',
'/usr/bin/cat', '/usr/bin/ls', '/usr/lib', '/usr/lib/my_lib',
'/usr/lib/gcc', '/usr/lib/gcc/x86_64-linux-gnu']
```

## The problem

The problem arises if there's a lot of folders to collect. If you have thousands, or millions of files and folders in your directory, storing all of it in a list might be trouble, for two reasons:

- Your ram usage can randomly skyrocket. There's no limit to how big the list can grow, so you could technically even run out of memory.
- If you only cared about a few items inside the folder, you're out of luck -- the algorithm will find out _every single sub-folder_, and only then you can do something with it.

Essentially, it's an **eagerly evaluated** algorithm. The only way to avoid storing all of it would be to perform the task directly inside the function, like what we did in the case of `print`ing it out directly. But that couples our code strongly.

## The solution

So this is our problem: we want to do arbitrary run any code we want with each file path we want. The task could be to print it out, to store it in a list, or anything else:

```python
def get_paths_recursive(folder, path=()):
    name, contents = folder
    path = (*path, name)

    ## Do something with the `path` here,
    ## Example: print(path), or paths.append(path)

    for item in contents:
        if isinstance(item, str):
            ## Do something with the `path + item` here...
        else:
            for subpath in get_paths_recursive(item, path):
                ## Do something with the `subpath` here...

    return paths
```

Python gives you a really powerful construct made to solve exactly this problem, and it's called **generators**.

You might have heard about generators in some other context, like this:

```python
def gen():
    yield 10
    yield 20
    yield 10

for item in gen():
    print('Got:', item)

# Got: 10
# Got: 20
# Got: 10
```

But there's a much lesser known fact about generators: _They can be used to move your evaluation between two points in code._

This is what I mean:

```python
def gen():
    print("Start!")
    yield 1

    print("Now we're calculating stuff in gen()")
    value = sum(range(10))
    yield value

    print("Last value!")
    yield 42
    print("Done.")


for item in gen():
    print(f"Doing things with {item}...")
```

You can see how the execution goes back and forth between `gen()` and the for-loop:

```text
$ py a.py
Start!
Doing things with 1...
Now we're calculating stuff in gen()
Doing things with 45...
Last value!
Doing things with 42...
Done.
```

This is exactly what we need in our case: We need to give the execution context back to the main code whenever we have a new path. So we can just `yield` the control from the generator, to the loop:

```python
def get_paths_generator(folder, path=()):
    name, contents = folder
    path = (*path, name)

    yield '/'.join(path)

    for item in contents:
        if isinstance(item, str):
            yield '/'.join((*path, item))
        else:
            for subpath in get_paths_generator(item, path):
                yield subpath
```

Now the best part, is that we can create both the original usecases, of printing and storing a list really easily:

```python
$ python -i find.py
>>> list(get_paths_generator(file_tree))
['', '/etc', '/etc/passwd', '/etc/shadow', '/usr', '/usr/bin',
'/usr/bin/cat', '/usr/bin/ls', '/usr/lib', '/usr/lib/my_lib',
'/usr/lib/gcc', '/usr/lib/gcc/x86_64-linux-gnu']

>>> for path in get_paths_generator(file_tree):
...     print(path)

/etc
/etc/passwd
/etc/shadow
/usr
/usr/bin
/usr/bin/cat
/usr/bin/ls
/usr/lib
/usr/lib/my_lib
/usr/lib/gcc
/usr/lib/gcc/x86_64-linux-gnu
```

This solution is a lot more flexible, and will never have the same eager evaluation problems as the original one did.

## Bonus: `yield from`

The original code that used `append` to store paths can have a slight improvement: Instead of writing a for-loop to append each subpath one by one, you can use `list.extend`:

```python
    ...
    for item in contents:
        if isinstance(item, str):
            paths.append('/'.join((*path, item)))
        else:
            ## REPLACING THIS LOOP:
            # for subpath in get_paths_recursive(item, path):
            #     paths.append(subpath)
            paths.extend(get_paths_recursive(item, path))
```

The same thing can be done in our generator solution, using `yield from gen()`:

```python
def get_paths_generator(folder, path=()):
    name, contents = folder
    path = (*path, name)

    yield '/'.join(path)

    for item in contents:
        if isinstance(item, str):
            yield '/'.join((*path, item))
        else:
            yield from get_paths_generator(item, path)
```

`yield from` will yield all values inside the other generator, one by one.

## Footer

And that's it! Hopefully you'll find use of generators to improve your new (and old) recursive code in Python.

James Powell has an [in-depth talk][1] about generators that expands more on this idea, so take a look at that if you wish.

[1]: https://www.youtube.com/watch?v=XEn_99daJro
