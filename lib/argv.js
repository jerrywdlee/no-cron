/**
 * Copyright (c) 2019 Jerry Lee <jerrywdlee@gmail.com>
 *
 * This project is dual licensed under
 * Anti 996 License Version 1.0 & Mozilla Public License 2.0
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * See Anti 996 License Version 1.0 Here:
 * https://github.com/jerrywdlee/no-cron/blob/master/LICENSE#L5
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * See Mozilla Public License 2.0 Here:
 * https://github.com/jerrywdlee/no-cron/blob/master/LICENSE#L52
 *
 */

'use strict'

const { join } = require('path')
const { readFileSync } = require('fs')
const program = require('commander')

const package_json = JSON.parse(readFileSync(join(__dirname, '../package.json')))

program.version(package_json.version, '-v, --version')
program.usage('[options] <file ...>')
program.option('-f --file <filePath>', 'Cron file')
program.option('-t --timeout <timeoutSec>', 'Timeout(sec)')

program.parse(process.argv)

module.exports = program