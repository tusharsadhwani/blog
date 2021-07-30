---
title: "Connecting androind apps to localost, simplified"
description: "This is a test."
publishDate: "Tuesday, July 30 2021"
author: "Tushar"
heroImage: "/social.jpg"
alt: "Test"
layout: "../../layouts/BlogPost.astro"
---

> P.S. if you're in a hurry, find the correct solution [here](#the-correct-easy-way)

I was working on a full stack side project a few months ago, and I wanted to make API requests from my android app to my desktop, and for some reason `localhost:8000` wasn't simply accessible by my phone.

Well, understandable, I know that every device's localhost is independent and cannot be accessed by your home network (your Wi-Fi, for example). So the localhost on my laptop won't be able to access the localhost on my phone.

So, I asked Google for help. And I got a large number of solutions, the most sensible one being "use the internal IP address of your PC", et voilà.

# The Bad way

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tgakgpfuw4eyvjud9tin.png)

<figcaption>Use ipconfig if you're on windows</figcaption>

Running `ip addr` on my machine tells me that the laptop's internal IP is `192.168.29.76`.

And sure enough, as long as both devices were using the same Wi-Fi network, accessing `http://192.168.29.76:8000` instead of `http://localhost:8000` did work. My Android app can now make web requests to my local backend server 🎉

But this solution is... a bit unstable.

The internal IP of your laptop can keep changing whenever it connects to Wi-Fi, depending on various factors. And everytime it changes, you have to change the URL in your app's code, which is not ideal.

There's other ways as well like using ngrok, but it faces similar issues.

# The Correct, easy way

use `adb reverse`.

Yup, that's it.

Connect your android device to your pc via USB, ensure you have [adb setup](https://www.xda-developers.com/install-adb-windows-macos-linux/), and run this in your terminal:

```bash
adb reverse tcp:8000 tcp:8000
```

Now, your mobile can access `localhost:8000`, just like your PC. (you can replace `8000` with whichever port you want to forward)

# Why did nobody tell me this?

Yeah, I was also surprised when I was unable to find anyone on Google or StackOverflow mentioning the existence of `adb reverse` when I tried to look for it.

Which is why I wrote this blog. Now hopefully, `adb reverse` will become more popular.

If you know why `adb reverse` isn't as popular, let me know. Also, if you know another android developer that should know about this little productivity hack, why not share this blog with them? :P

---

Cover image courtesy of <a href="https://unsplash.com/@ffstop?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Fotis Fotopoulos</a> on <a href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
