# no-cron
A node.js based fake cron.

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
