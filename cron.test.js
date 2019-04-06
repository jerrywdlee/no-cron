const CronJobs = require('./cron')
const { existsSync, readFileSync, unlinkSync } = require('fs')

// jest.useFakeTimers()

describe('Test CronJobs', () => {
  const outPutFile = 'test_result.log'

  beforeEach(async () => {
    clearResFile(outPutFile)
  })

  afterEach(async () => {
    clearResFile(outPutFile)
  })

  test('Should create CronJobs instance', async () => {
    const jobs = new CronJobs({ cronText: '', exit: () => {} })
    expect(jobs).not.toBeUndefined()
  })

  test('Should load Cron from text', async () => {
    const cronText = '* * * * * bash -l -c \'echo `date` > /dev/null 2>&1\''
    const jobs = new CronJobs({ cronText })
    expect(jobs.cronText).toBeTruthy()
    expect(jobs.jobs.length).toBe(1)
  })

  test('Should load Cron from file', async () => {
    const file = 'test_cron.txt'
    const jobs = new CronJobs({ file })
    expect(jobs.fileName).toBeTruthy()
    expect(jobs.jobs.length).toBe(3)
  })

  test('Should throw error if no such file', async () => {
    const file = 'no_such_file.txt'
    expect(() => {
      new CronJobs({ file })
    }).toThrow()
  })

  test('Should run command when cron triggered', async () => {
    const cronText = `* * * * * * bash -l -c 'echo \`date\` > ./${outPutFile}'`
    const jobs = new CronJobs({ cronText })
    jobs.start()
    // jest.advanceTimersByTime(60 * 1000)
    await delay(2200)
    expect(existsSync(outPutFile)).toBeTruthy()
    jobs.stop()
  }, 5 * 1000)

  test('Should run command with env', async () => {
    const home = process.env['HOME']
    const cronText = `* * * * * * bash -l -c 'echo $HOME > ./${outPutFile}'`
    const jobs = new CronJobs({ cronText })
    jobs.start()
    await delay(2200)
    expect(existsSync(outPutFile)).toBeTruthy()
    const resText = readFileSync(outPutFile, 'utf8')
    expect(resText.includes(home)).toBeTruthy()
  }, 5 * 1000)

  test('Should exit if no cron found', async () => {
    const exitCallback = jest.fn()
    const jobs = new CronJobs({ exit: exitCallback })
    jobs.start()
    expect(exitCallback).toBeCalled()
    expect(jobs.jobs.length).toBe(0)
  })

  test('Should restart cron jobs with new conditions', async () => {
    const exitCallback = jest.fn()
    const jobs = new CronJobs({ exit: exitCallback })
    jobs.start()
    expect(exitCallback).toBeCalled()
    expect(jobs.jobs.length).toBe(0)

    const cronText = '* * * * * bash -l -c \'echo `date` > /dev/null 2>&1\''
    jobs.cronText = cronText
    jobs.restart()
    expect(jobs.jobs.length).toBe(1)
  })
})

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function clearResFile(file) {
  if (existsSync(file)) {
    unlinkSync(file)
  }
}
