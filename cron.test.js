const CronJobs = require('./cron')
const { existsSync, readFileSync, unlinkSync } = require('fs')

describe('Test CronJobs', () => {
  const outPutFile = 'test_result.log'

  beforeEach(async () => {
    if (existsSync(outPutFile)) {
      unlinkSync(outPutFile)
    }
  })

  test('Should create CronJobs instance', async () => {
    const jobs = new CronJobs()
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

})
