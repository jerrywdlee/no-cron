<h1 align="center">no-cron</h1>
A node.js based fake cron. Will run cron jobs with current environment variables.  

[![CircleCI](https://circleci.com/gh/jerrywdlee/no-cron.svg?style=svg)](https://circleci.com/gh/jerrywdlee/no-cron)
[![Coverage Status](https://coveralls.io/repos/github/jerrywdlee/no-cron/badge.svg)](https://coveralls.io/github/jerrywdlee/no-cron)
[![Maintainability](https://api.codeclimate.com/v1/badges/ccff0672287ccfc884b6/maintainability)](https://codeclimate.com/github/jerrywdlee/no-cron/maintainability)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)


## Usage

### Run in cli

```sh
# Need node.js v8+
$ npm install
$ node cron # This will execute cronjobs in system crontab
$ node cron -f my_cron.txt # Execute cronjobs wrote in a file called `my_cron.txt`
```
### Run as daemon

```sh
$ npm i && npm i -g pm2
$ pm2 start cron.js
# OR
$ pm2 start cron.js -- -f my_cron.txt
```

## Known issues

- Errors when execute node.js scripts in a different version of node.js

## LICENSE
This project is under **[Anti 996 License & Mozilla Public License](https://github.com/jerrywdlee/no-cron/blob/master/LICENSE)**.  

Click here for more info about **[Anti 996 Project](https://996.icu/#/en_US)**.

Copyright (c) 2019 Jerry Lee
