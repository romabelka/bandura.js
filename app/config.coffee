_ = require('../bower_components/underscore/underscore.js')

baseConfig = {
  env: 'dev'
}

module.exports = _.extend {}, baseConfig,
  isProdEnv: baseConfig.env is 'prod'
  isDevEnv: baseConfig.env is 'dev'
  isTestEnv: baseConfig.env is 'test'