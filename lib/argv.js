const { join } = require('path')
const { readFileSync } = require('fs')
const program = require('commander')

const package_json = JSON.parse(readFileSync(join(__dirname, '../package.json')))

program.version(package_json.version, '-v, --version')
program.usage('[options] <file ...>')
program.option('-f --file <fileName>', 'cron file')

program.parse(process.argv)

module.exports = program