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
    this.init()
  }

  init() {
    let cronText
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
      cronText = execSync('crontab -l').toString()
    }

    const cronWithCmds = []
    cronText.split(/\r\n|\r|\n/).forEach(line => {
      const splitedLine = line.split(/\s/)// .map(w => w.trim())
      // cron syntax like `* * * * *` or `* * * * * *`
      for (const len of [5, 6]) {
        if (splitedLine[len - 1]) {
          const cronAndCmd = lineToCornCmd(line, splitedLine, len)
          if (cronAndCmd) {
            cronWithCmds.push(cronAndCmd)
            return
          }
        }
      }
    })

    const jobs = cronWithCmds.map(cnc => {
      const [cond, cmd] = cnc
      if (cond && cmd) {
        return new CronJob(cond, async () => {
          try {
            await exa(cmd, { timeout: this.timeoutSec * 1000 })
          } catch (error) {
            console.error(error)
          }
        })
      }
    }).filter(c => c)

    this.cronWithCmds = cronWithCmds
    this.jobs = jobs
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

function parseCronLine(cronTimeStr, line) {
  try {
    new CronTime(cronTimeStr)
    const cmd = line.replace(cronTimeStr, '')
    return cmd.trim()
  } catch (e) { }
}

function lineToCornCmd(line, splitedLine, len, from = 0) {
  const cronTimeStr = splitedLine.slice(from, len).join(' ')
  const cmd = parseCronLine(cronTimeStr, line)
  if (cmd) {
    return [cronTimeStr, cmd]
  }
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
