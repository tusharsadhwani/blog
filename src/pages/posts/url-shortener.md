---
title: "How I made my own URL shortener for free"
description: "It's quick, it's easy, and it's free! Oh, and it's actually pretty useful and clever."
publishDate: "Tuesday, 1 September 2020"
author: "Tushar Sadhwani"
heroImage: "/images/url-shortener.jpg"
alt: "How I made my own URL shortener for free"
layout: "../../layouts/BlogPost.astro"
---

URL shorteners are great. You can take a long URL and make it 6–8 characters, you know the drill.

And the free URL shorteners are pretty nice too! **bit.ly** is what I used, and it did its job pretty well, but free public shorteners have a few issues:

- Finding the perfect short URL is hard: most of the short ones that make sense, are usually already taken.
- the URLs are hard to update: _(and I don’t know if this is a bit.ly specific issue)_, **but you can’t change the URL the short link points to**, once it has been created.

So I decided to make my own instead.

## Step 1: Getting a short domain

The entire point of a URL shortener is to be short, and for that you need to get a short domain name. Fortunately, services like [Dot tk](http://dot.tk) exist, which provide domains from various TLDs at no cost. (If you’re a university student, you can also use the GitHub Student pack for domains like **.me**).

I got the domain **tshr.me** for myself.

![free short domains for everyone!](https://dev-to-uploads.s3.amazonaws.com/i/6x3o1hq4ma6nk26vqmy7.png)_free short domains for everyone!_

## Step 2: Making the URLs redirect

Traditionally, URLs run off of a hosted web server, which are also relatively easy to make, [as shown in this video for example.](https://www.youtube.com/watch?v=gq5yubc1u18)

But the issue with a web server solution is that you have to host it, and **hosting ain’t free.**

Sure, there’s services like [Heroku](https://heroku.com), which is a great platform, but it’s inadequate for our use case:

- Its free dynos only run for 550 hours a month, which means you either have to add your credit card information, or there will be no guarantees that your links will always work.
- Free dynos **go to sleep after 1 hour of inactivity**, meaning if someone tries to access your URLs after a long time, they might have to wait a significantly long time before they get redirected. _(This can possibly be fixed by scheduling_ [_cron jobs_](https://cron-job.org/) _to ping the server, but it’s not a great solution.)_
- And most importantly: **Heroku’s free tier doesn’t support custom domain names!**

So we will have to use a different approach.

## GitHub to the rescue — Part 1

You should be knowing already, that GitHub can hosts static websites for free on its platform called **GitHub Pages**.

But you might be thinking, _“Yes, I know you can use GitHub for static websites, but you can’t use it to host web servers, dummy.”_

… or can you. 🤨

Nah, you can’t host a web server on GitHub, but you can do the next best thing: host a static URL shortener.

```html
<html>
  <head>
    <meta http-equiv="refresh" content="0;url=https://medium.com" />
  </head>
  <!-- Old Method: requires JavaScript   
  <script>
    window.location.replace('https://medium.com');
  </script> -->
</html>
```

This script, when ran in a browser, will redirect you to **medium.com** immediately. Put this file in a repository on GitHub, add the domain name **tshr.me** to the GitHub Pages custom domain field, and BOOM!💥

**tshr.me** now redirects to **medium.com**.

… you don’t seem very impressed. Don’t worry, we’ll get there.

## Just Automate it (with Python!)

Here comes the fun part:

If we could generate all the static short links we want that use the above technique to redirect to the actual URL we want, then this technique might be of some actual use, right?

So I wrote a python scripts that takes in JSON data of various short links and their corresponding redirect URLs, and generates all the HTML pages for me.

```python
def main():
    html = '<html><head><meta http-equiv="refresh" content="0;url={url}" /></head></html>'

    with open('links.json') as f:
        links = json.load(f)

    os.mkdir('dist')

    for link in links:
        html_document = html.format(url=link['url'])

        linkname = link['name']
        file_path = f'dist/{linkname}.html'

        with open(file_path, 'w') as f:
            f.write(html_document)


if __name__ == "__main__":
    main()
```

The corresponding JSON data looks like this:

```json
[
  {
    "name": "index",
    "url": "https://tusharsadhwani.dev"
  },
  {
    "name": "cv",
    "url": "https://tusharsadhwani.dev/assets/resume.pdf"
  }
]
```

Now we’re talking! Running this script generates your HTML redirects and places them neatly in a folder, which you can upload to your GitHub.

But this isn’t exactly the most convenient, right? Every time you have to update your URLs, you have to _update the JSON file, run the python code, push the folder to GitHub…_

It just sounds really cumbersome. And it is.

## GitHub to the rescue — Part 2

Here’s where we use GitHub’s slightly less known, but really powerful tool: **GitHub Actions.**

![Github Actions promo](https://dev-to-uploads.s3.amazonaws.com/i/y4lsjmlqpfxovxbz8gd2.png)

GitHub Actions is GitHub’s super powerful builtin CI/CD tool. It runs a virtual machine for you, that can pull your code, test it, and deploy it, every single time you push an update to your repository. All for no cost at all.

What we are going to do is use its Python workflow that runs our HTML generator script for us, and use a plugin to create a separate GitHub Pages branch to deploy it to, automatically.

Using this, we can update our short links by simply editing and saving our links.json file, everything else will be handled for us by GitHub.

**But first,** we need to make some arrangements.

## Deploy Keys: a short explanation

GitHub has a feature called Deploy Keys, which are essentially just SSH keys that have read/write access to your repository, so a computer that has that key can push code to your repo directly.

To add a deploy key to your GitHub repo, follow these simple steps:

- Generate an SSH key:
  open your terminal/command prompt and type `ssh-keygen`
  Give it any name you like (using the repository name would be good), use an empty passphrase for it, and keep everything else default.  
  This will generate a private key file, and a public `.pub` file, both with the same name.  
  _(If the command_ `_ssh-keygen_` _doesn’t work, you might have to install OpenSSH on your system)_

![You just generated an SSH public-private key pair!](https://dev-to-uploads.s3.amazonaws.com/i/hyssr7nq0gmbhbtctpho.png)

<figcaption>You just generated an SSH public-private key pair!</figcaption>

- Open your repository settings, and go to the Deploy Keys tab.  
  It should look something like this:

![Deploy Keys in GitHub](https://dev-to-uploads.s3.amazonaws.com/i/9vd0q51ub8by6fdifwvf.png)

- Click on “Add deploy key” on the top right, and copy-paste the entire contents of the `.pub` file that you just generated. **(Make sure to click the “write access” checkbox)**:

![The title of the key doesn’t really matter here.](https://dev-to-uploads.s3.amazonaws.com/i/7mjl0gb479g8q7ksgyn3.png)

<figcaption>The title of the key doesn’t really matter here.</figcaption>

- Then head down to the **Secrets** section of your repository settings, and add a new secret named `ACTIONS_DEPLOY_KEY`, and copy your private key into it. It should look something like:

![That’s a long secret.](https://dev-to-uploads.s3.amazonaws.com/i/znap67oz7d72ls2mmv7i.png)

<figcaption>That’s a long secret.</figcaption>

And that’s it! We can now get into **the Action** (pun intended).

## Final step: Setting up the GitHub Action

![The workflow we will be using](https://dev-to-uploads.s3.amazonaws.com/i/bejlitlom7cg47ucxu2x.png)

<figcaption>The workflow we will be using</figcaption>

Simply navigate to the Actions tab, and click on the Python Application workflow. Replace its contents with the ones provided below:

```yaml
name: Python Deploy

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Set up Python 3.8
        uses: actions/setup-python@v2
        with:
          python-version: 3.8

      - name: Build
        run: python main.py

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          publish_dir: ./dist
```

And we’re done!

> You can create your own free URL shortener by simply forking my repository:

[https://github.com/tusharsadhwani/url-shortener](https://github.com/tusharsadhwani/url-shortener),

adding a secret and a deploy key to your repo with write access, and changing the website name from **tshr.me** to whatever your domain name is, in the `main.py` file.

Thanks for reading this article!  
Big thanks from my side to [Coding Garden](https://www.youtube.com/channel/UCLNgu_OupwoeESgtab33CCw), whose videos motivated me to make this project in the first place, and [this article](https://medium.com/@cmichel/how-to-deploy-a-create-react-app-with-github-actions-5e01f7a7b6b), which led me to the free hack that I came up with. Also thanks to [Wojtek Pawlik](https://github.com/wojpawlik) _(GingerPlusPlus)_ for suggesting a non-javascript method for redirects.
