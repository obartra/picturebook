const test = require('tape')
const os = require('os')
const requireContext = require('require-context')
const { resolve } = require('path')
const { runTests, getFiles } = require('../dist')

const storyRoot = resolve(__dirname, './stories')
const overwrite = process.argv.includes('-u')

const osPlatform = os.platform() === 'darwin' ? 'osx' : 'linux'
const sauceConnectBinaryPath = resolve(
  __dirname,
  `./bin/sauceconnect-${osPlatform}`
)
const tunnel = {
  id: 'picturebook-sample',
  binaryPath: sauceConnectBinaryPath,
}

function getErrorMessage({
  status,
  diffPath,
  referencePath,
  screenshotPath,
  diffThreshold,
  error,
}) {
  return `Comparison failed:
  Difference: ${diffPath || '[Not available]'}
  Reference: ${referencePath || '[Not available]'}
  New: ${screenshotPath || '[Not available]'}
  Threshold: ${diffThreshold || '[Not available]'}
  Status: ${status || '[Not available]'}
  Error: ${error || '[Not available]'}
  `
}

runTests({
  storyRoot,
  files: getFiles({
    stories: requireContext(storyRoot, true, /\.(js|png)/),
  }),
  overwrite,
  tunnel,
  configPath: resolve(__dirname, 'nightwatch.conf.js'),
  outputPath: resolve(__dirname, 'picturebook-results.json'),
})
  .then(({ results, error }) => {
    test('should succeed', t => {
      t.equal(error, null)
      t.end()
    })

    results.forEach(result => {
      const { platform, browser, name, status } = result

      test(`${platform}.${browser}.${name}`, t => {
        let success
        if (overwrite) {
          success = ['SUCCESS', 'CREATED'].includes(status)
        } else {
          success = status === 'SUCCESS'
        }
        if (!success) {
          console.log(getErrorMessage(result))
        }
        t.equal(success, true)
        t.end()
      })
    })
  })
  .catch(e => {
    console.error('Screenshot capturing failed', e.stack)
  })
