'use strict'

const { CronJob, CronTime } = require('cron')
const { exec, execSync } = require('child_process')
const { existsSync, readFileSync } = require('fs')
const { promisify } = require('util')
const exa = promisify(exec)

class CronJobs {
  constructor(opt = {}) {
    if (typeof opt.exit !== 'function') {
      this.exit = exitStatus => { throw Error(`Exit status: ${exitStatus}`) }
    } else {
      this.exit = opt.exit
    }
    this.timeoutSec = opt.timeout || process['env']['NO_CRON_TIMEOUT'] || 90
    this.cronText = opt.cronText
    this.fileName = opt.file
    this.cronWithCmds = []
    this.jobs = []
    this.init()
  }

  init() {
    let cronText = ''
    if (this.cronText) {
      cronText = this.cronText
    } else if (this.fileName) {
      const fileName = this.fileName
      if (existsSync(fileName)) {
        cronText = readFileSync(fileName, 'utf8')
      } else {
        console.error(`No such file: ${fileName}`)
        this.exit(1)
      }
    } else {
      try {
        cronText = execSync('crontab -l').toString()
      } catch (e) {
        console.error(`No crontab found`)
        this.exit(1)
      }
    }

    this.cronWithCmds = formCronWithCmds(cronText)
    this.jobs = cronCmdsToJobs(this.cronWithCmds, this.timeoutSec)
  }

  start() {
    const jobs = this.jobs
    jobs.forEach(j => j.start())
    if (jobs.length > 0) {
      const time = new Date().toString()
      console.log(`${jobs.length} cron job(s) started at: ${time}.`)
    } else {
      console.log('No cron job found!')
      this.exit(2)
    }
  }

  stop() {
    const jobs = this.jobs
    jobs.forEach(j => j.stop())
    console.log(`${jobs.length} cron job(s) stoped.`)
  }

  restart() {
    this.stop()
    this.init()
    this.start()
  }
}

function validateCronCond(cronTimeStr) {
  try {
    new CronTime(cronTimeStr)
    return true
  } catch (e) { }
}

function lineToCornCmd(line, splitedLine, len, from = 0) {
  const cronTimeStr = splitedLine.slice(from, len).join(' ')
  const isCronVaild = validateCronCond(cronTimeStr)
  if (isCronVaild) {
    const cmdStartWord = splitedLine[len]
    const cmdStartIndex = line.indexOf(cmdStartWord)
    const cmd = line.substring(cmdStartIndex)
    return [cronTimeStr, cmd.trim()]
  }
}

function formCronWithCmds(cronText) {
  const cronWithCmds = []
  cronText.split(/\r\n|\r|\n/).forEach(line => {
    const splitedLine = line.split(/\s+/)// .map(w => w.trim())
    // cron syntax like `* * * * *` or `* * * * * *`
    for (const len of [6, 5]) {
      if (splitedLine[len - 1]) {
        const cronAndCmd = lineToCornCmd(line, splitedLine, len)
        if (cronAndCmd) {
          cronWithCmds.push(cronAndCmd)
          return
        }
      }
    }
  })
  return cronWithCmds
}

function cronCmdsToJobs(cronWithCmds, timeoutSec) {
  const jobs = cronWithCmds.map(cnc => {
    const [cond, cmd] = cnc
    if (cond && cmd) {
      return new CronJob(cond, async () => {
        try {
          await exa(cmd, { timeout: timeoutSec * 1000 })
        } catch (error) {
          console.error(error)
        }
      })
    }
  }).filter(c => c)
  return jobs
}

module.exports = CronJobs

if (!module.parent) {
  const argv = require('./lib/argv')
  const opt = { ...argv }
  const jobs = new CronJobs(opt)
  // FOR DEBUG:
  jobs.cronWithCmds.forEach(cnc => console.log(...cnc))
  jobs.start()
}
