---
title: "How to setup PostgreSQL on Manjaro linux / Arch"
description: "This guide is here just because I’ve messed up the installs on arch before, and turns out it’s actually pretty easy to do."
publishDate: "Tuesday, July 30 2021"
author: "Tushar Sadhwani"
heroImage: "/social.jpg"
alt: "Test"
layout: "../../layouts/BlogPost.astro"
---

This guide is here just because I've messed up the installs on arch before, and turns out it's actually pretty easy to do.

## Step 1 - Install the dependencies

```
sudo pacman -S yay
yay postgresql pgadmin4
```

This should automatically setup your postgres user and group.

## Step 2 - Setup postgres service

```
sudo -u postgres -i # login as postgres
initdb --locale $LANG -E UTF8 -D '/var/lib/postgres/data/'
exit

sudo systemctl enable --now postgresql
sudo systemctl status postgresql # to check for any errors
```

## Step 3 - Setup password

```
psql -U postgres

postgres=# \password # to set password
```

## Step 4 - Setup connection security

```
$ su

# cd /var/lib/postgres/data
# cp pg_hba.conf pg_hba.conf.backup # in case you mess up
# nano pg_hba.conf
```

Your default pg_hba.conf might look like this:

```plaintext
 TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
```

"Method" is set to trust, meaning it won't ask for the password to anyone. To fix that, change the method from `trust` to `md5` everywhere.

And that should be it for postgres!

## Bonus: shortcuts

```
> psql dbname postgres # to directly open a database

postgres=# \c                       # see current database
postgres=# \l                       # see list of databases
postgres=# \c dbname                # set database
postgres=# create database dbname;  # create database
postgres=# \dt                      # see list of tables
```

## Step 6 - PgAdmin

Open up pgadmin, click on "Add New Server", and add the following:

```plaintext
Host: localhost
Port: 5432
Maintenance database: postgres
Username: postgres
Password: <your password>
```

And PgAdmin should work just fine.
