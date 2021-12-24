---
title: "Learn Python ASTs, by building your own linter"
description: "The only resource you need to read to learn about ASTs in Python, and the superpowers they give you."
publishDate: "Thursday, 4 November 2000"
author: "Tushar Sadhwani"
heroImage: "/images/ast.jpg"
alt: "Learn Python ASTs, by building your own linter"
layout: "../../layouts/BlogPost.astro"
---

> This is currently a work in progress.

<!-- Remember to add a twitter mention here :") -->

## So what is an AST?

In programmer terms, "ASTs are a programmatic way to understand the structure of your source code". But to understand what that really means, we must first understand a few things about the structure of a computer program.

The programs that you and I write in our language of choice is usually called the "source code", and I'll be referring to it as such in this article.

On the other end, computer chips can only understand "machine code", which is a set of binary numbers that have special meanings for that model of the chip. Some of these numbers are _instructions_, which tell the CPU a simple task to perform, like "add the numbers stored in these two places", or "jump 10 numbers down and continue running code from there". The instructions run one by one, and they dictate the flow of the program.

Similarly, you define your programs as a set of "statements", with each statement being one thing that you want your code to do. They're sort of a more human-friendly version of the CPU instructions, that we can write and reason with more easily.

Now, I know that theory can get boring really quick, so I'm going to go through a bunch of examples. Let's write the same piece of code in many languages, and notice the similarities:

- Python

  ```python
  def area_of_circle(radius):
      pi = 3.14
      return pi * radius * radius

  area_of_circle(5)
  # Output: 78.5
  ```

- Scheme Lisp

  ```lisp
  (define (area_of_circle radius)
    (define pi 3.14)
    (* pi radius radius))

  (area_of_circle 5)
  ; Output: 78.5
  ```

- Go

  ```go
  package main

  func area_of_circle(radius float64) float64 {
    pi := 3.14
    return pi * radius * radius
  }

  func main() {
    println(area_of_circle(5))
  }
  // Output: +7.850000e+001
  ```

We're doing essentially the same thing in all of these, and I'll break it down piece by piece:

- We're defining our source code as a block of statements. In our case, there are two statements at the top-level of our source code: one statement that defines our `area_of_circle` function, and another statement that runs this function with the value "5".

- The definition of the `area_of_circle` function has two parts: the input parameters (the radius, in our case), and the body, which itself is a block of statements. There's two statements inside `area_of_circle` to be specific: the first one defines `pi`, and the second one uses it to calculate the area, and returns it.

- For the languages that have a main function, the definition of the main function itself is a statement. Inside that statement we are writing _more statements_, like one that prints out the value of `area_of_circle` called with the radius of 5.

You can start to see the somewhat repetitive nature of source code. There's blocks of statements, and sometimes within those statements there can be more statements, and so on. If you imagine each statement to be a "node", then you can think of each of these nodes being composed of one or more other "nodes". You can properly define this kind of structure as a "tree":

```text
                 (program)
                /         \
  (area_of_circle r)      (main)
  /           |             |
define    calculate        run area_of_circle
  pi        area             with r = 5
           /   |
     multiply  (pi, r, r)
```

The nodes here can be anything, from statements, to expressions, to any other construct that the language defines. Once the code is in this tree structure, computers can start to make sense of it, such as traversing its nodes one by one and generate the appropriate machine code.

Essentially, all your code represents a tree of data. And that tree is called the **Abstract Syntax Tree**. Each programming language has its own AST representation, but the idea is always the same.

And to be able to create tools that do things like auto-format your code, or find subtle bugs automatically, you need ASTs to be able to meaningfully read through find items or patterns inside the code and act on it.

## Python's `ast` module

Python has a builtin `ast` module, which has a rich set of features to create, modify and run ASTs from Python code. Not all languages provide easy access to their syntax trees, so Python is already pretty good in that regard. Let's take a look at what all the `ast` module gives us, and try to do something interesting with it:

### All the `Node`s

There are a lot of kinds of "Nodes" in a Python AST each with their own functionalities, but you can broadly divide them into four categories: **Literals**, **Variables**, **Statements** and **Expressions**. We'll take a look at them one by one, but before we do that we need to understand how a "Node" is represented.

The role of a node is to concretely represent the features of a language.

It does so by:

- Storing the attributes specific to itself, (for example, an `If` node that represents a for loop might need a `condition` attribute, that is an expression that evaluates to `true` or `false`. The if statement's body will only run when `condition` ends up being `true`.
- Defining what children the node can have. (In our `If` node's case, it should have a `body`, that is a list of statements.)

Let's see the concrete example of this if statement, in Python's AST representation.

For this source code:

```python
if answer == 42:
    print('Correct answer!')
```

The AST looks like this:

```python
Module(
  body=[
    If(
      test=Compare(
        left=Name(id='answer', ctx=Load()),
        ops=[Eq()],
        comparators=[Constant(value=42)]
      ),
      body=[
        Expr(
          value=Call(
            func=Name(id='print', ctx=Load()),
            args=[Constant(value='Correct answer!')],
            keywords=[]
          )
        )
      ],
      orelse=[]
    )
  ],
  type_ignores=[]
)
```

Let's break this down:

Ignoring the details for now, the overall structure of the AST looks like this:

```python
Module(
  body=[
    If(
      test=Compare(...),
      body=[
        ...
      ],
    )
  ],
)
```

At the top level, is a `Module`. All Python files are compiled as "modules" when making the AST. Modules have a very specific meaning: anything that can be run by Python classifies as a module. So by definition, our Python file is a module.

It has a body, which is a list. Specifically, a list of **statements**. All Python files are just that: a list of statements. Every Python program that you've ever written, read or run -- just that.

In our case, we have just one statement in the module's body: an `If`-statement. The if-statement has two components: a `test`, and a `body`. The `test` part holds the _condition expression_, and the `body` holds the block of statements that's inside the if.

Let's look at the `test` "expression" first:

```python
If(
  test=Compare(
    left=Name(id='answer', ctx=Load()),
    ops=[Eq()],
    comparators=[Constant(value=42)]
  ),
  ...
```

In our case, we have a `Compare` expression -- which makes sense. Python defines comparisons [quite thoroughly](https://docs.python.org/3/reference/expressions.html#comparisons) in its reference, and if you read it, you'll find that Python supports _comparison chaining_.

From the docs:

> Python's comparison expressions support this syntax:
>
> `a op1 b op2 c ...`
>
> Which is equivalent to:
>
> `a op1 b and b op2 c and ...`

In human terms, this means that Python can support stuff like this:

```python
x = get_number()
if 0 < x < 10:
    print('Your number is a single digit!')
```

And `0 < x < 10` is the same as asking `0 < x and x < 10`.

Here's the important part: for Python to support this, the _AST needs to support this_. And Python's AST supports comparison chaining by storing the operators and the comparators (variables) inside **lists**. You can look at it in the REPL itself:

```python
>>> import ast
>>> def get_ast(code):
...     print(ast.dump(ast.parse(code), indent=2))
...
>>> get_ast('a < b > c > d')
Module(
  body=[
    Expr(
      value=Compare(
        left=Name(id='a', ctx=Load()),
        ops=[Lt(), Gt(), Gt()],
        comparators=[
          Name(id='b', ctx=Load()),
          Name(id='c', ctx=Load()),
          Name(id='d', ctx=Load())
        ]
      )
    )
  ],
  type_ignores=[]
)
```

> If you actually run this code, you might notice that the output here has different whitespace compared to what I have in my blog. It's just personal preference, if you find an output similar to mine more readable you can install `astpretty` from pip, and use `astpretty.pprint(node, show_offsets=False, indent=2)`

You can see that the operators `<`, `>` and `>` are stored as `ops=[Lt(), Gt(), Gt()]` inside the `Compare` object. The four values are stored a bit more peculiarly: The variable `a` is stored in a separate field called `left`, and then every other variable is stored in a list called `comparators`:

```python
comparators=[
  Name(id='b', ctx=Load()),
  Name(id='c', ctx=Load()),
  Name(id='d', ctx=Load()),
],
...
```

In other words: the leftmost variable is stored in `left`, and every variable on the right of each operator is stored in the respective index of `comparators`.

Hopefully that clarifies what the `test` expression in our example code:

```python
If(
  test=Compare(
    left=Name(id='answer', ctx=Load()),
    ops=[Eq()],
    comparators=[Constant(value=42)]
  ),
  ...
```

`left` is the `Name` node 'answer' (basically, a variable), and we have just one comparison going on: `Eq` being applied on the constant value `42`. Essentially it is the `answer == 42` part of the code.

Now let's look at the body:

```python
    If(
      test=...,
      body=[
        Expr(
          value=Call(
            func=Name(id='print', ctx=Load()),
            args=[Constant(value='Correct answer!')],
            keywords=[]
          )
        )
      ],
      orelse=[]
    )
```

The body in our case is a single `Expr`-ession. Note that, when I said that a block or module always contains a list of statements, I wasn't lying. This `Expr` right hereis actually an **expression-statement**. Yeah, I'm not making this up, it will make sense in a bit.

### Aside: Expressions vs. Statements

Statements are pretty easy to define. They're kind of like the building blocks of your code. Each statement does something that you can properly define. Such as:

- Creating a variable

  ```python
  x = 5
  ```

  This one becomes an `Assign` statement:

  ```python
  Assign(
    targets=[
      Name(id='x', ctx=Store())
    ],
    value=Constant(value=5)
  )
  ```

  Pretty straightforward, the node stores a target and a value. `targets` here is a list because you can also do multiple assignments: `a = b = 5`. There will only be one value, though.

- Importing a module

  ```python
  import random
  ```

  This one becomes an `Import` statement:

  ```python
  Import(
    names=[
      alias(name='random')
    ]
  )
  ```

- Asserting some property

  ```python
  assert False
  ```

  Becomes:

  ```python
  Assert(
    test=Compare(
      left=Name(id='a', ctx=Load()),
      ops=[Eq()],
      comparators=[
        Name(id='b', ctx=Load())
      ]
    )
  )
  ```

- Doing absolutely nothing

  ```python
  pass
  ```

  Becomes:

  ```python
  Pass()
  ```

On the other hand, an expression is basically anything that evaluates to a value. Any piece of syntax that ends up turning into a "value", such as a number, a string, an object, even a class or function. As long as it returns a value to us, it is an expression.

This includes:

- Identity checks

  This refers to the `is` expression:

  ```python
  >>> a = 5
  >>> b = a
  >>> b
  5
  >>> a is b
  True
  ```

  Clearly, `a is b` returns either `True` or `False`, just like any other conditional check. And since it returns a value, it is an expression.

  Here's its AST:

  ```python
  Compare(
    left=Name(id='a', ctx=Load()),
    ops=[Is()],
    comparators=[
      Name(id='b', ctx=Load())
    ]
  )
  ```

  And it really is just like conditionals. Turns out `is` is treated just as a special operator (like `<`, `==` and so on) inside a `Compare` object when talking about ASTs.

- Function calls

  Function calls return a value. That makes them the most obvious example of an expression:

  ```python
  >>> from os import getpid
  >>> getpid()
  15206
  ```

  Here's what the AST for `getpid()` looks like, it'se essrntially just a `Call`:

  ```python
  Call(
    func=Name(id='getpid', ctx=Load()),
    args=[],
    keywords=[]
  )
  ```

  `print('Hello')` would look like this, it has one argument:

  ```python
  Call(
    func=Name(id='print', ctx=Load()),
    args=[Constant(value='hello')],
    keywords=[]
  )
  ```

- Lambdas

  Lambdas themselves are expressions. When you create a lambda function, you usually pass it directly as an argument to another function, or assign it to a variable. Here's some examples:

  ```python
  >>> lambda: 5
  <function <lambda> at 0x7f684169cb80>
  >>> returns_five = lambda: 5
  >>> returns_five()
  5
  >>> is_even = lambda num: num % 2 == 0
  >>> list(filter(is_even, [1, 2, 3, 4, 5]))
  [2, 4]
  >>> list(filter(lambda num: num % 2, [1, 2, 3, 4, 5]))
  [1, 3, 5]
  ```

  And there's the `Lambda` expression for `lambda: 5` in the AST:

  ```python
  Lambda(
    args=arguments(
      posonlyargs=[],
      args=[],
      kwonlyargs=[],
      kw_defaults=[],
      defaults=[]
    ),
    body=Constant(value=5)
  )
  ```

Now, if you think about it, a call to `print()` in a regular code, it's technically a statement, right?

```python
def greet():
    print('Hello world!')
```

As I've said before, blocks of code are essentially just a list of statements. And we also know, that calling `print` is technically an expression (it even returns `None`!). So what's going on here?

The answer is simple: Python lets you treat any expression as a standalone statement. The expression is going to return some value, but that value just gets discarded.

Getting back to our original AST:

```python
    If(
      test=...,
      body=[
        Expr(
          value=Call(
            func=Name(id='print', ctx=Load()),
            args=[Constant(value='Correct answer!')],
            keywords=[]
          )
        )
      ],
      orelse=[]
    )
```

We have an `Expr` in our body, which is Python's way of saying "This is an expression that's being used as a statement. The actual expression is inside it, a `Call` to `print`.

The last thing left in this example AST is the last line: `orelse=[]`. `orelse` refers to `else:` blocks anywhere in the AST. The name `orelse` was chosen because `else` itself is a keyword and can't be used as attribute names.

Oh, did you know that `for` loops in Python can have an else clause?

<details>
<summary> Extras: The for-else clause </summary>

`for`-`else` is really interesting. The `else` in for loops is run whenever the loop runs to its entirety. In other words, it is _not_ run, when you break out of the loop before it finishes.

It's useful for many use-cases, one of them being searching through a list:

```python
items = ['Bag', 'Purse', 'Phone', 'Wallet']

for item in items:
    if item == 'Phone':
        print('Phone was found in items!')
        break

else:
    print('Phone was not found in items :(')
```

If we had an `else`-clause on our for loop, like:

```python
for item in items:
    print(item)
else:
    print('All done')
```

The AST would look more interesting:

```python
For(
  target=Name(id='item', ctx=Store()),
  iter=Name(id='items', ctx=Load()),
  body=[
    Expr(
      value=Call(
        func=Name(id='print', ctx=Load()),
        args=[
          Name(id='item', ctx=Load())],
        keywords=[]
      )
    )
  ],
  orelse=[
    Expr(
      value=Call(
        func=Name(id='print', ctx=Load()),
        args=[
          Constant(value='All done')
        ],
        keywords=[]
      )
    )
  ]
)
```

Pretty straightforward. Also, `If` statements have the exact same `orelse` property as for loops when it comes to ASTs.

</details>

If you want a detailed reference of all the Nodes that we have in a Python AST, and the corresponding syntax it belongs to, you can either head on to the [docs here](https://docs.python.org/3/library/ast.html#node-classes), or just use `ast.dump` on a line of code to try and find out for yourself.

### What's a `ctx`?

Ideally, I want you to leave from this article understanding every single aspect of Python's ASTs. And if you're one of the few super observant readers, you might have noticed that we glanced over a very small thing in the AST examples shown. You can see it in this code snippet:

```python
Compare(
  left=Name(id='a', ctx=Load()),
  ops=[Eq()],
  comparators=[
    Name(id='b', ctx=Load())
  ]
)
```

We've talked about `Compare`, we've talked about what the `left`, `ops` and `comparators` fields represent, we've also talked about `Name` nodes. The only thing left is `ctx=Load()`. What exactly does that mean?

If you check all the code snippets we've seen so far, we've actually seen 27 instances of `Name` nodes in the examples. Out of the 27, 25 have had the property `ctx=Load()`, but two of them have a different value: `ctx=Store()`. Like this one:

```python
Assign(
  targets=[
    Name(id='x', ctx=Store())
  ],
  value=Constant(value=5)
)
```

`ctx` (short for "context") is an essential concept of Python (and many other programming languages), and it is related to the whole concept of "variables".

If I were to ask you "what's a variable?" You might say something like "It can store values which you can use later.", and give some example like:

```python
age = 21    # Here `age` is being used to store data
print(age)  # The stored data is being taken out here
```

And that's exactly what it is. If you look at the AST for this code:

```python
>>> def get_ast(code):
...      print(ast.dump(ast.parse(code), indent=2))
...
>>> get_ast('''
... age = 21
... print(age)
... ''')
Module(
  body=[
    Assign(
      targets=[
        Name(id='age', ctx=Store())
      ],
      value=Constant(value=21)),
    Expr(
      value=Call(
        func=Name(id='print', ctx=Load()),
        args=[
          Name(id='age', ctx=Load())
        ],
        keywords=[]
      )
    )
  ],
  type_ignores=[]
)
>>>
```

So the first statement is an `Assign`, and the variable `age` is in the "Store" context (because a new value is being stored into it), and in the second statement it is in "Load" context. Interestingly, `print` itself is a variable that's being loaded in this statement. Which makes sense, print is essentially a function somewhere in memory, which is accessible by us using the name `print`.

Let's look at a couple more. What about this?

```python
age = age + 1
```

The AST looks like this:

```python
Assign(
  targets=[
    Name(id='age', ctx=Store())
  ],
  value=BinOp(
    left=Name(id='age', ctx=Load()),
    op=Add(),
    right=Constant(value=1)
  )
)
```

The `age` on the right is in "Load" mode and the one on the left is in "Store" mode: that's why this line of code makes sense. This should probably help in explaining that line of code to a newbie programmer in the future.

One more interesting example is this:

```python
x[5] = y
```

The AST looks like this:

```python
Assign(
  targets=[
    Subscript(
      value=Name(id='x', ctx=Load()),
      slice=Constant(value=5),
      ctx=Store()
    )
  ],
  value=Name(id='y', ctx=Load())
)
```

Here, `x` is actually in "Load" mode even though it's on the left side of the assignment. And if you think about it, it makes sense. We need to load `x`, and then modify one of its indices. It's not `x` which is being assigned to, only one _index_ of it is being assigned. So the part of the AST that is in `Store` context is the `Subscript`, i.e. it is `x[5]` is what's being assigned a new value.

Hopefully this explains _why_ we explicitly need to tell each variable whether it is in a load or store context in the AST.

For the sake of completion, I should mention that there's only three AST nodes in Python that have a `ctx` property, which is `Name` (as we have seen so many times now), `Subscript` (which refers to the `x[y]` syntax, i.e. indices of a list, dictionary, etc.), and `Attribute` which is what's used to represent members inside an object, like `obj.x`. This means there's exactly 3 constructs in the language that can be used to store values.

## Walking the Syntax Trees with Visitors

So now we know that our AST represents code using nested Nodes, a structure that is called a "tree". We also know that in a tree structure, a node can have as many children nodes inside it as needed. With all that, comes the question of how does one "read" the tree.

The most obvious way would be to read it top to bottom, the way it appears in the AST dump that we've seen so many times:

```python
>>> get_ast('''
... age = 21
... print(age)
... ''')
Module(
  body=[
    Assign(
      targets=[
        Name(id='age', ctx=Store())
      ],
      value=Constant(value=21)),
    Expr(
      value=Call(
        func=Name(id='print', ctx=Load()),
        args=[
          Name(id='age', ctx=Load())
        ],
        keywords=[]
      )
    )
  ],
  type_ignores=[]
)
```

We have a `Module`, which has two nodes in its body: an `Assign` which has a `Name` and a `Constant`, and an `Expr` which has a `Call` with a couple `Name` nodes.

This way of reading from parent node to child node, in the sequence they appear, is called a pre-order traversal of the tree. And for most intents and purposes, it is what you need.

To implement this sort of traversal of an AST, Python provides you the `NodeVisitor` class, which you can use like this:

```python
import ast

class MyVisitor(ast.NodeVisitor):
    def generic_visit(self, node):
        print(f'entering {node.__class__.__name__}')
        super().generic_visit(node)

visitor = MyVisitor()

tree = ast.parse('''
age = 21
print(age)
''')
visitor.visit(tree)
```

This outputs the following:

```python
entering Module
entering Assign
entering Name
entering Store
entering Constant
entering Expr
entering Call
entering Name
entering Load
entering Name
entering Load
```

> PENDING

~~Give an example of what we could use pre order for, and for post-order. Then mention in-order being useful for code generation.

## The power of AST manipulation

Some really bizarre examples of modifying your code's runtime behaviour go here.

~~ explain transformers here?

> Quote from docs: "Keep in mind that if the node you’re operating on has child nodes you must either transform the child nodes yourself or call the `generic_visit()` method for the node first."

~~ A good, meaningful example of a transformer here would be great, as we're only building a linter later on.

~~ Mention zxpy :)

### AST utilities

~~ fix missing locations, literal eval, parse/unparse, and walk

## Let's build: A simple linter

ASTs let you examine code patterns as well, they're really nice.

## What about code formatters?

You need whitespace info, comments and other details that ASTs drop, like what
kind of quotes did you use, single or double. for that for most cases.
Which means you need a CST.

Differentiate between the two, and point towards libcst.

## Where can I learn more?

Read the docs, ast, libcst and and greentreesnakes.