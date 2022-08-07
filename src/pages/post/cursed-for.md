---
title: "How I added C-style for-loops to Python"
description: "Or alternatively: How I made the most cursed Python package of all time."
publishDate: "Sunday, 7 August 2022"
author: "Tushar Sadhwani"
heroImage: "/images/cursed-for.jpg"
alt: "How I added C-style for-loops to Python"
layout: "../../layouts/BlogPost.astro"
---

It's true. It turns out, you can, in fact, add C-style for loops into Python.
The way to get there however, was long, and painful all the way to the end.

Regardless, I've learned many things (some of which I hope nobody _ever_ uses in
production), and I'm here to share with you, all the gruesome details. I hope
you find it helpful (or at the very least, entertaining).

## The Path to get there

I had to try 3 different approaches in order to finally get to the image that
you see at the top. And hence, I've sectioned the blog into 3 parts:

- Part 1: The "simple" implementation
- Part 2: Making our own language inside Python
- Part 3: The "Truly Cursed" way

But before all of that, let's answer the big question: "why?".

## Part 0: The beginning

In the beginning, I had a dumb idea:

> _"Can I possibly put the 3-statement for-loop from C into Python?"_

I mocked up an idea that I though I could make, and posted it on
[twitter](https://twitter.com/sadhlife/status/1497501076589019139):

![The mockup snippet](https://user-images.githubusercontent.com/43412083/173145281-1a63ad93-56c0-4fd0-b8f1-78e7bf7005d6.png)

... and immediately, I got some intriguing reactions:

![Twitter response 1](https://user-images.githubusercontent.com/43412083/183288619-4d5531fa-b7bc-46a1-9168-1464dc94a7d6.png)

![Twitter response 2](https://user-images.githubusercontent.com/43412083/183288864-1cae2530-3fa2-478d-8a1e-d70eda401019.png)

![Twitter response 3](https://user-images.githubusercontent.com/43412083/183288703-b4360ea9-7c69-4109-b63b-0e18bfa5dcc6.png)

So I decided it'd be worthwhile to try and make this a reality. Simple as that.

## Part 1: The "simple" implementation

I wanted it to look like a regular for-loop from C as much as possible:

```cpp
for (int i = 0; i < 10; i++) {
  printf("%d", i);
}
```

But there's a couple big problems:

- The builtin `for` syntax requires you to have an `in` clause:

  ```python
  for <variable> in <some expression that gives an iterable>:
      ...
  ```

  Which is pretty restrictive. So our second best bet is to implement a function
  instead -- one that takes in three arguments. I went with `_for(x, y, z)`.

  For the `for` to be a block, I needed a generic block kind of statement, one
  that allows us to put arbitrary code inside it: so I close a `with` block:
  `with` blocks can be customized with `__enter__` and `__exit__`.

- The second problem is much bigger: The original `for` loop syntax takes in
  **statements**. Notice that `int i = 0` and `i++` are statements, ones which
  declare and assign a variable respectively.

  Whereas, Python functions take in "expressions", things that return a value.
  This one is much harder to hack in, but I have one idea to save the day:

  We need to do assignment, but we are limited to expressions. Hmmm... where
  have I heard of this before... oh right. **Assignment expressions.**

  Python 3.8 has come to save the day. Let's try it out.

Hence, I started with this rough idea:

```python
with _for(i := var(0), i < 10, i + 2):
    print(i)
```

> Yeah, it's not the greatest syntax of all time, but you have to be confined to
> Python syntax when writing Python (... or so I thought, more on that later).

The first argument `i := var(0)` is what will initialise our `i` variable. But,
it is no ordinary variable, mind you. For the second and third argument to work,
`i < 10` and `i + 2` should _behave_ as the condition and increment part of the
for loop. Thankfully, By overriding functions like `__lt__` and `__add__`, we
can customize how this `i` variable behaves when we do these comparisons and
additions.

Now, all that's left is to implement this `_for` and `var` thing.

### Implementing `var`

We want `var` to be able to do these 3 things at least:

- Support storing a value inside it when initializing, i.e. `var(0)`.
- Support creating conditions with comparisons: `i < 10` should return a
  "conditional" type, which we will use later.
- Support creating the "increment", i.e. `i + 2` should return an "increment"
  type, which we will also use later.

So I started with a simple `var` class:

```python
class var:
    def __init__(self, value) -> None:
        self.value = value

    def __repr__(self) -> str:
        return repr(self.value)


i = var(0)
print(i)  # prints 0
```

I then added comparison support, by making a `_Comparison` type, and
implementing `__lt__`, such that doing `i < something` stores that information:

```python
class _Comparison:
    def __init__(self, var, op, value):
        self.var = var
        self.op = op
        self.value = value

    def __repr__(self) -> str:
        return f"Comparing var({self.var!r}) {self.op} {self.value!r}"


class var:
    def __init__(self, value):
        self.value = value

    def __repr__(self) -> str:
        return repr(self.value)

    def __lt__(self, value):
        return _Comparison(var=self, op="<", value=value)
```

Pretty simple so far:

```python
>>> i = var(0)
>>> print(i)
0
>>> comp = i < 10
>>> print(comp)
Comparing var(i) < 10
>>> type(comp)
<class '__main__._Comparison'>
>>> comp.op
'<'
>>> comp.value
10
```

This `_Comparison` objects stores all information about the comparison, and this
gets passed down to the `_for()` function.

We do the same for increment:

```python
class _Increment:
    def __init__(self, var, op, value):
        self.var = var
        self.op = op
        self.value = value

    def __repr__(self) -> str:
        return f"Incrementing var({self.var!r}) with {self.op}{self.value!r}"

class var:
    [...]

    def __add__(self, value):
        return _Increment(var=self, op="+", value=value)
```

```python
>>> x = var(10)
>>> x + 2
Incrementing var(10) with +2
```

Alright! Now to the next part.

### Implementing `_for`

`_for()` must return a context manager, because we're using it with a `with`
statement, so we'll use the [`contextlib.contextmanager`][1] decorator to
quickly make one:

```python
from contextlib import contextmanager

@contextmanager
def _for(variable, comparison, increment):
    print(f"We initialized the variable as {variable}.")
    print(
      f"We'll increment the value by {increment.op}{increment.value} "
      f"each time, until it ~~stays~~ {comparison.op} {comparison.value}."
      )
    yield

with _for(i := var(0), i < 10, i + 2):
    ...
```

And this way, we should have all the information needed:

```text
$ python cursedfor.py
We initialized the variable as 0.
We'll increment the value by +2 each time, until it stays < 10.
```

Let's do the looping now, shall we?

```python
from contextlib import contextmanager

@contextmanager
def _for(variable, comparison, increment):
    value = variable.value
    while value < comparison.value:
        print(value)
        value += increment.value

    yield


with _for(i := var(0), i < 10, i + 2):
    ...
```

And the output:

```text
$ python cursedfor.py
0
2
4
6
8
```

It works! Let's try a couple other cases:

```python
>>> with _for(i := var(1), i < 10, i + 3):
...   print(f"{i = })
...
1
4
7
i = 1
```

Great! ... wait a second.

### Generalizing

We're not actually executing the body of the for loop as many times, we're
simply printing out `value`, which is hardcoded. The body is still only executed
once. That's not what we wanted at all!

Let's try to hack around this.

### Stack manipulation

What now? Does the `with` statement create its own stack, so we can, in theory,
find the body of the `with` statement and execute that N times?

Let's check using the `dis` module:

```python
>>> import dis
>>> dis.dis('''
... with x:
...   pass
... ''')
  2           0 LOAD_NAME                0 (x)
              2 SETUP_WITH              16 (to 20)
              4 POP_TOP

  3           6 POP_BLOCK
              8 LOAD_CONST               0 (None)
             10 DUP_TOP
             12 DUP_TOP
             14 CALL_FUNCTION            3
             16 POP_TOP
             18 JUMP_FORWARD            16 (to 36)
        >>   20 WITH_EXCEPT_START
             22 POP_JUMP_IF_TRUE        26
             24 RERAISE
        >>   26 POP_TOP
             28 POP_TOP
             30 POP_TOP
             32 POP_EXCEPT
             34 POP_TOP
        >>   36 LOAD_CONST               0 (None)
             38 RETURN_VALUE
```

Nope. Since there's only one block of output, that shows there's no separate
code object for a `with` statement's body. Compare this to a function:

```python
>>> dis.dis('''
... def foo():
...   pass
...
... foo()
... ''')
  2           0 LOAD_CONST               0 (<code object foo at 0x7f318f54bf50, file "<dis>", line 2>)
              2 LOAD_CONST               1 ('foo')
              4 MAKE_FUNCTION            0
              6 STORE_NAME               0 (foo)

  5           8 LOAD_NAME                0 (foo)
             10 CALL_FUNCTION            0
             12 POP_TOP
             14 LOAD_CONST               2 (None)
             16 RETURN_VALUE

Disassembly of <code object foo at 0x7f318f54bf50, file "<dis>", line 2>:
  3           0 LOAD_CONST               0 (None)
              2 RETURN_VALUE
```

You can see there's two disassemblies, of two separate code objects. So that's
a no-go.

But hey, we can still access the stack frame...

```python
>>> frame = inspect.currentframe()
```

And I could read the code object inside it...

```python
>>> frame.f_code
<code object <module> at 0x7f03e9d90f50, file "<stdin>", line 1>
>>> frame.f_code.co_code
b'e\x00\xa0\x01\xa1\x00Z\x02d\x00S\x00'
>>> frame.f_lasti
10
```

`f_lasti` also tells us which of those bytes (instructions) was last executed,
which means the code after it must contain the body of the `with` statement!

So if we could just extract the bytecode and then run the body manually N times,
we could...

### Giving up

Here's one (obvious) piece of advice -- if your current approach devolves into
you trying to rewrite the Python interpreter, you have messed up.

Let's backtrack, and try to think of some other possibility.

### Part 2: Making our own language inside Python

Thanks to [another such project][zxpy] that I made in the past, I learned the
fact that you can add _arbitrary semantics_ into Python -- essentially, if
something is valid Python code, you could _transform_ it to suit your needs. All
you need is this one simple trick: **AST manipulation**.

Here's what I mean:

We can take any piece of code:

```python
>>> code = '2 + 3'
```

You can parse it (as long as it's valid "Syntax")

```python
>>> import ast
>>> tree = ast.parse(code)
>>> print(ast.dump(tree, indent=2))
Module(
  body=[
    Expr(
      value=BinOp(
        left=Constant(value=2),
        op=Add(),
        right=Constant(value=3)))],
  type_ignores=[])
```

You can change what the code actually means:

```python
# Substituting addition with subtraction
>>> tree.body[0].value.op = ast.Sub()
```

And you can generate code back out of it:

```python
>>> ast.unparse(tree)
'2 - 3'
```

Which you're free to execute as you please. This example is really simplified,
but with enough transformation, you can turn any Python code into anything else.

So let's do exactly that.

### Building a for-loop transformer

What we want the following code:

```python
with _for(i := 0, i < 10, i + 2):
    <the body>
```

into the following:

```python
i = 0
while i < 10:
    <the body>
    i += 2
```

We can break this down into three distinct parts:

- Find all `with _for()` statements inside a code block
- Transform the `with _for()` into the initializer and `while` statements.
- Replace all the instances with the two statements instead.

Let's do them in that order:

### Find the cursed loops

We'll be using an `ast.NodeTransformer` class which helps us find and replace
AST nodes inside the code easily. We'll be implementing its `generic_visit()`
method, to find all AST nodes that have a `body`, and find cursed `_for` blocks
inside them.

```python
class CursedForTransformer(ast.NodeTransformer):
    def generic_visit(self, node: ast.AST) -> ast.AST:
        super().generic_visit(node)

        if hasattr(node, "body") and isinstance(node.body, list):
            new_body = []
            for stmt in node.body:
                if isinstance(stmt, ast.With):
                    if any(
                        self.is_cursed_for_call(expr.context_expr)
                        for expr in stmt.items
                    ):
                        item_replacements = self.replace_cursed_for(stmt)
                        new_body.extend(item_replacements)
                        continue

                # If it wasn't a cursed `with` node, add it to body.
                new_body.append(stmt)

              node.body = new_body

          return node
```

> If you want to deep dive into what's going on here with `generic_visit` etc.,
> check out [this post][2].

Essentially:

- We're finding all blocks in our code, by finding `body` attributes:

  ```python
  if hasattr(node, "body") and isinstance(node.body, list):
  ```

- Then we're trying to find `with` statements, which contain the cursed
  for-loops:

  ```python
  if isinstance(stmt, ast.With):
      if any(
          self.is_cursed_for_call(expr.context_expr)
          for expr in stmt.items
      ):
  ```

- And if found, we call `self.replace_cursed_for(stmt)` to replace it with the
  initializer and while loop, in the `new_body`:

  ```python
  item_replacements = self.replace_cursed_for(stmt)
  new_body.extend(item_replacements)
  continue
  ```

- Otherwise, if it's not a cursed for loop, we just add the node to the body,
  unchanged:

  ```python
  # If it wasn't a cursed `with` node, add it to body.
  new_body.append(stmt)
  ```

  And we update the node's body, and return.

Here's the code for `self.is_cursed_for_call`, it just checks if the function is
called `_for`:

```python
    @staticmethod
    def is_cursed_for_call(node: ast.AST) -> bool:
        return (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == "_for"
        )

```

### Implementing the cursed-for transformer

We have yet to see how `self.replace_cursed_for(stmt)` works. In essence it just
has to return a list of two nodes:

- An initializer (like `i = 0`),
- And a `while` loop, containing the condition and the `with` body.

Here's the function, simplified and documented for explanation:

```python
def replace_cursed_for(self, node: ast.With) -> list[ast.AST]:
    # Get the `_for(init, condition, increment)` node
    cursed_for_call: ast.Call = node.items[0].context_expr
    # Extract `init`, `condition` and `increment`
    init_node, condition_node, increment_node = cursed_for_call.args

    # Turn the init expression into a statement, i.e. from `i := 0` to `i = 0`
    init_variable: ast.Name = init_node.target
    init_statement = ast.Assign(targets=[init_variable], value=init_node.value)

    # Turn the increment expression into a statement, i.e. `i + 2` to `i += 2`
    increment_statement = ast.AugAssign(
        target=init_variable,
        op=increment_node.op,
        value=increment_node.right,
    )

    # Add the increment statement at the end of the while loop's body
    block_body = [*node.body, increment_statement]
    while_statement = ast.While(test=condition_node, body=block_body, orelse=[])

    # Return the initializer and while loop
    return [init_statement, while_statement]
```

To show it in action, here's the transformation it does:

```python
>>> tree = ast.parse('''
... def foo():
...     with _for(i := 10, i <= 0, i - 3):
...         print("The value is:", i)
... ''')
>>> modified_tree = CursedForTransformer().visit(tree)
>>> print(ast.unparse(modified_tree))
>>> ast.fix_missing_locations(modified_tree)
<ast.Module object at 0x7f7a18bebf70>
>>> print(ast.unparse(modified_tree))

def foo():
    i = 10
    while i <= 0:
        print('The value is:', i)
        i -= 3
```

It works! We can finally use this to run our cursed for loops!

If you wish to try this out yourself, you can check out [cursedfor.py][3] in the
GitHub repository, download it and run the REPL.

<details>

<summary> How the cursed REPL works </summary>

Python's standard library never ceases to amaze me. Even for a usecase as weird
as creating a custom REPL, Python lets you do that by itself. Specifically,
there exists a `code` module, which contains primitives such as
`code.InteractiveConsole`.

`InteractiveConsole` is a pre-built Python REPL, which by default works the same
way you would expect Python's interactive console to work:

```python
import code

class CursedConsole(code.InteractiveConsole):
    pass

CursedConsole().interact(banner=f"Cursed Python REPL", exitmsg="")
```

```text
$ python cursedfor.py
Cursed Python REPL
>>> x = 5
>>> x
5
>>>
```

Completely normal.

But, you can override any of its functions to change their functionality.

In our case, we can change the `runsource` method, which is responsible for
running a single statement or expression at a time. Here's the full
implementation:

```python
class CursedConsole(code.InteractiveConsole):
    def runsource(
        self,
        source: str,
        filename: str = "<input>",
        symbol: str = "single",
    ) -> bool:
        # First, check if it could be incomplete input, return True if it is.
        # This will allow it to keep taking input
        with suppress(SyntaxError, OverflowError):
            if code.compile_command(source) == None:
                return True

        try:
            tree = ast.parse(source, filename, mode=symbol)
            CursedForTransformer().visit(tree)
            ast.fix_missing_locations(tree)
        except (ValueError, SyntaxError):
            # Let the original implementation take care of incomplete input / errors
            return super().runsource(source, filename, symbol)

        code_obj = compile(tree, filename, mode=symbol)
        self.runcode(code_obj)
        return False
```

The `code.compile_command` part returning `True` is important to support
multiline statements in the REPL, like these:

```python
>>> def foo():
...     print(42)
...
>>>
```

Support for multiline input and exceptions comes for free because we used this
class.

Apart from that, the interesting part is this:

```python
try:
    tree = ast.parse(source, filename, mode=symbol)
    CursedForTransformer().visit(tree)
except (ValueError, SyntaxError):
    [...]

code_obj = compile(tree, filename, mode=symbol)
self.runcode(code_obj)
```

We simply modified the AST tree before passing it on to `self.runcode`.

This is actually amazing. Using this same class and a custom `NodeTransformer`,
you can build basically any DSL or mini language that uses Python's syntax.

If you want to try doing it yourself, the starter code is present [here][4].

</details>

### Is that it?

I was finally done with this project, but it always stayed in the back of my
mind. I just felt that I hadn't done it justice.

And so, a couple months later, I got to know of a much, _much_ better way to do
this. And it was everything that I could've ever wanted.

## Part 3: The "Truly Cursed" way

I stumbled upon [this library][5], which tries to add braces to Python instead
of indentation. And although the implementation is questionable, it gave me
**exactly** the tool I needed to finish this project: `codecs`.

### What the heck is a codec?

A "codec" in Python refers to the tools that let you convert the text encoding
of a source file into a Python string, and (in case of source code) can run the
code.

A lot of pre-built codecs exist, such as `utf-8`, `cp1252`, and `ascii`, so that
people can write their code in whichever file encoding they prefer to use, and
Python will pre-process the file into the text format that it understands,
before trying to run it.

There's just one tiny detail: You can write your own custom codecs.

### Source translation

So here's the new idea: What if instead of AST manipulation, we manipulated the
source text directly before it runs?

Yeah, I know, it's probably a bad idea. But I think it can work. And you can't
stop me, so you might as well see what I have to say.

The approach in my mind is pretty simple:

- Find the `for (init; condition; increment):` pattern in the source code
- Substitute that text with two lines: `init` and `while condition:`
- Append the `increment` statement at the end of the `for` body.

Let's try it out then.

### Time for regex hacks

To create the encoding, we first need to implement a transformation function. I
chose to implement one that works ona list of Python source lines. Here's the
boilerplate:

```python
import codecs

def _transform_cursed_for(lines: list[str]) -> list[str]:
    new_source = []
    index = 0
    while index < len(lines):
        line = lines[index]

        # Do stuff with the line
        new_source.append(line)
        index += 1

    return new_source

def transform_cursed_for(source: str) -> str:
    lines = source.splitlines()
    new_lines = _transform_cursed_for(lines)
    return "\n".join(new_lines)

codecs.register(
  {'cursed_for': codecs.CodecInfo(
    name='cursed_for',
    encode=utf_8.encode,
    decode=cursed_for_decode,
  )}.get
)
```

Now for the details on how we match and replace `for (x; y; z):` lines:

- First, you match the syntax:

  ```python
  beginning_with_for_regex = re.compile(r'^\s*for\b')

  if beginning_with_for_regex.match(line):
      ...
  ```

- If we find such a line, we find the three parts and the indentation of the
  inner block:

  ```python
  indent_regex = re.compile(r'^\s*')
  cursed_for_regex = re.compile(r'^\s*for\s*\((.+?);(.+?);(.+?)\):(.*)$')

  match = cursed_for_regex.match(line)
  initializer, condition, increment = match[1], match[2], match[3]

  # The indentation of the `for ():` line
  for_indent_level = indent_regex.match(line).group()

  # Read the next line
  next_line = lines[index]
  index += 1

  # The indentation of the inner block
  body_indent_level = indent_regex.match(next_line).group()
  ```

- Now, we collect all the lines which are inside the `for` block, by finding all
  lines which are indented at the same level as the first line:

  ```python
  for_body_lines = [next_line]

  while index < len(lines):
      next_line = lines[index]
      if not next_line.startswith(body_indent_level):
          break

      for_body_lines.append(next_line)
      index += 1
  ```

- At the end, we add in the two initializer and `while` statemnets:

  ```python
  initializer_stmt = f'{for_indent_level}{initializer.strip()}'
  while_stmt = f'{for_indent_level}while {condition.strip()}:'
  increment_stmt = f'{body_indent_level}{increment.strip()}'

  new_source.append(initializer_stmt)
  new_source.append(while_stmt)
  new_source.extend(for_body_lines)
  new_source.append(increment_stmt)
  ```

So that's how I did it. And to my own surprise, it works!

```python
code = '''
for (i = 0; i < 10; i += 2):
    print(i)
print("done")
'''
print(code.decode('cursed_for'))
```

```python
$ python cursedfor.py
i = 0
while i < 10:
    print(i)
    i += 2
print("done")
```

Is this useful, at all? Probably not. Is it cursed? **YES.**

Can this knowledge be useful in making actually good Python packages? You tell
me!

### The making of perhaps the most cursed Python package

There's just one more thing left to do: Make this an installable package.

And honestly, that part of the process is a lot more black-magic hackery than
what we've even seen so far. I basically copied what this other project called
[future-fstrings][6] does, and you can watch [this video][7] if you're really
curious.

In essence, we need to register this encoding at Python's startup time. And we
do that by creating a `.pth` file which must be stored into the `site-packages`
folder, which will get auto imported when Python starts up.

And with that, our package is complete.

### Test drive

You can now install the package:

```text
pip install cursed-for
```

And run your cursed python files with a `# coding` comment at the top:

```python
# coding: cursed-for
for (i = 5; i < 10; i += 2):
    print(i)
```

```text
$ python x.py
5
7
9
```

Can you do this in a REPL? Can you debug the output? Absolutely! Check out the
[repository's README][8] for more info.

And that's it from me. I... hope you learned something useful? I sure did.

[1]: https://docs.python.org/3/library/contextlib.html#contextlib.contextmanager
[2]: https://sadh.life/post/ast
[3]: https://github.com/tusharsadhwani/cursed-for/blob/master/approach/ast_manipulation/cursedfor.py
[4]: https://github.com/tusharsadhwani/t/blob/master/custom_interpreter.py
[5]: https://pypi.org/p/cstyle
[6]: https://github.com/asottile-archive/future-fstrings
[7]: https://www.youtube.com/watch?v=00h6aKnAdyY
[8]: https://github.com/tusharsadhwani/cursed-for
[zxpy]: https://github.com/tusharsadhwani/zxpy
