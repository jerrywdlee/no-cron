# no-cron
A node.js based fake cron.

## Usage

```sh
# Need node.js v8+
$ npm install
$ node cron # This will execute cronjobs in system crontab
$ node cron my_cron.txt # Execute cronjobs wrote in a file called `my_cron.txt`
```

## Known issues

- Errors when execute node.js scripts in a different version of node.js
