<h1 align="center">no-cron</h1>

[![CircleCI](https://circleci.com/gh/jerrywdlee/no-cron.svg?style=svg)](https://circleci.com/gh/jerrywdlee/no-cron)
[![Build Status](https://travis-ci.org/jerrywdlee/no-cron.svg?branch=master)](https://travis-ci.org/jerrywdlee/no-cron)
[![Coverage Status](https://coveralls.io/repos/github/jerrywdlee/no-cron/badge.svg)](https://coveralls.io/github/jerrywdlee/no-cron)
[![Maintainability](https://api.codeclimate.com/v1/badges/ccff0672287ccfc884b6/maintainability)](https://codeclimate.com/github/jerrywdlee/no-cron/maintainability)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/jerrywdlee/no-cron/issues)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)

A node.js based fake cron. Will run cron jobs with current environment variables.  

## Usage
### Attention
Stop system's cron service before start `no-cron`, or all cron jobs will be multiple executed.

```sh
# Stop system cron service
$ service cron stop
[FAIL] cron is not running ... failed!
```

### Run in cli

```sh
# Need node.js v8+
$ npm install
$ node cron # This will execute cronjobs in system crontab
$ node cron -f my_cron.txt # Execute cronjobs wrote in a file called `my_cron.txt`
```
### Run as daemon
Plz install **[pm2](https://github.com/Unitech/pm2)** or **[forever](https://github.com/foreverjs/forever)** to daemonize `no-cron`

```sh
$ npm i && npm i -g pm2
$ pm2 start cron.js
# OR
$ pm2 start cron.js -- -f my_cron.txt
```

### Docker usage
Some docker example in `./docker` directory.

#### Docker

```sh
$ cd docker
$ docker build -t no-cron .
$ docker run no-cron
```

#### Docker Compose

```sh
$ cd docker
$ docker-compose build
$ docker-compose up
```

## Difference between [THE Cron](https://en.wikipedia.org/wiki/Cron)
The `Crontab` in UNIX/LINUX will run command in an isolated condition. Environment variables such as timezone will be different between cron environment and current environment.

When using time-based job scheduler in *docker containers* most environment variables will not imported to cron's environment.  
PS: Image **[node:10.15.3-alpine](https://hub.docker.com/_/node/)** doesn't have this problem, but **[ruby:2.6.1](https://hub.docker.com/_/ruby)** does.

Thus, most famous container IaaS providers such as **Heroku**, recommend users not to use cron inside containers.

But some legacy libraries and projects such as **[whenever](https://github.com/javan/whenever)** provide easier ways to maintenance time-based job scheduler with in source codes.

So `no-cron` will give a way to run cron jobs for legacy cron-based libraries or projects.
It will parse commands and schedules from crontab, and run them timely with environments as same as main projects.

For alpha stage, I just created a node.js based fack cron for my companies' Rails projects.  
Next time, I'll refactor it by Golang or Rust.

## Known issues

- Errors when execute node.js scripts in a different version of node.js

## LICENSE
This project is under **[Anti 996 License & Mozilla Public License](https://github.com/jerrywdlee/no-cron/blob/master/LICENSE)**.  

Click here for more info about **[Anti 996 Project](https://996.icu/#/en_US)**.

Copyright (c) 2019 Jerry Lee
