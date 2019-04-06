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
    const timeoutSec = opt.timeout || process['env']['NO_CRON_TIMEOUT'] || 90
    let cronText = ''
    if (opt.file) {
      const fileName = opt.file
      if (existsSync(fileName)) {
        cronText = readFileSync(fileName, 'utf8')
      } else {
        console.error(`No such file: ${fileName}`)
        this.exit(1)
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
            await exa(cmd, { timeout: timeoutSec * 1000 })
          } catch (error) {
            console.error(error)
          }
        })
      }
    }).filter(c => c)
    this.timeoutSec = timeoutSec
    this.cronJobs = cronJobs
    this.jobs = jobs
  }

  start() {
    const jobs = this.jobs
    jobs.forEach(j => j.start())
    if (jobs.length > 0) {
      const time = new Date().toString()
      console.log(`\n${jobs.length} cron job(s) started at: ${time}.`)
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
}

function parseCronLine(cronTimeStr, line) {
  try {
    new CronTime(cronTimeStr)
    const cmd = line.replace(cronTimeStr, '')
    return cmd.trim()
  } catch (e) { }
}

module.exports = CronJobs

if (!module.parent) {
  const argv = require('./lib/argv')
  const opt = { ...argv }
  const jobs = new CronJobs(opt)
  jobs.start()
}
