'use strict'

const fs = require('fs')
const path = require('path')
const paths = require('./paths')

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')]

const dotenvFiles = [paths.dotenv].filter(Boolean)

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    )
  }
})

const appDirectory = fs.realpathSync(process.cwd())
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter)

function getClientEnvironment() {
  const raw = Object.keys(process.env).reduce(
    (env, key) => {
      env[key] = process.env[key]
      return env
    },
    {
      NODE_ENV: process.env.NODE_ENV || 'development',
      VERSION: new Date().toISOString(),
      BUILD_MODE: process.env.BUILD_MODE || 'development',
      GAME_IS_MOCK: process.env.GAME_IS_MOCK || false,
      BACKEND_ADDR: process.env.BACKEND_ADDR || 'localhost:8080',
    }
  )
  // Stringify all values so we can feed into webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}

module.exports = getClientEnvironment
