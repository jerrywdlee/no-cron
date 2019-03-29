'use strict'

const { CronJob, CronTime } = require('cron')
const { exec, execSync } = require('child_process')
const { existsSync, readFileSync } = require('fs')
const { promisify } = require('util')
const exa = promisify(exec)
const argv = require('./lib/argv')

let cronText = ''

if (argv.file) {
  const fileName = argv.file
  if (existsSync(fileName)) {
    cronText = readFileSync(fileName, 'utf8')
  } else {
    console.error(`No such file: ${fileName}`)
    process.exit(1)
  }
} else {
  cronText = execSync('crontab -l').toString()
}

let cronJobs = []

cronText.split(/\r\n|\r|\n/).forEach(line => {
  const splitedLine = line.split(/\s/)// .map(w => w.trim())
  if (splitedLine[5]) {
    // cron syntax like `* * * * * *`
    const cronTimeStr = splitedLine.slice(0, 6).join(' ')
    const cmd = parseCronLine(cronTimeStr, line)
    if (cmd) {
      cronJobs.push([cronTimeStr, cmd])
      return
    }
  }
  if (splitedLine[4]) {
    // cron syntax like `* * * * *`
    const cronTimeStr = splitedLine.slice(0, 5).join(' ')
    const cmd = parseCronLine(cronTimeStr, line)
    if (cmd) {
      cronJobs.push([cronTimeStr, cmd])
      return
    }
  }
})

const jobs = cronJobs.map(cronJob => {
  const [cond, cmd] = cronJob
  if (cond && cmd) {
    // FOR DEBUG:
    console.log(cond, cmd)
    return new CronJob(cond, async () => {
      try {
        await exa(cmd)
      } catch (error) {
        console.error(error)
      }
    })
  }
}).filter(c => c)

jobs.forEach(j => j.start())

if (jobs.length > 0) {
  console.log(`${jobs.length} cron job(s) found, cron started.`)
} else {
  console.log('No cron job found!')
  process.exit(2)
}

function parseCronLine(cronTimeStr, line) {
  try {
    new CronTime(cronTimeStr)
    const cmd = line.replace(cronTimeStr, '')
    return cmd.trim()
  } catch (e) { }
}
