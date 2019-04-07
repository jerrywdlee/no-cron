const pm2 = require('pm2')
const argv = require('./lib/argv')

const startOpt = {
  script: `cron.js`,
  args: [],
}
if (argv.file) {
  startOpt['args'].push(argv.file)
}

pm2.connect( err => {
  if (err) {
    console.error(err)
    process.exit(2)
  }

  pm2.start(startOpt, (err, apps) => {
    console.log(apps)
    pm2.disconnect()
    if (err) { throw err }
  })

})