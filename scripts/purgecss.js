const fs = require('fs')
const path = require('path')
const { PurgeCSS } = require('purgecss')
const purgecssFromHtml = require('purgecss-from-html')

const rootPath = process.cwd()
const tsxPath = path.join(rootPath, 'src', 'components')
const buildPath = path.join(rootPath, 'build')

const htmlFilePath = path.join(buildPath, 'index.html')

const tsxPathArr = fs
  .readdirSync(tsxPath)
  .filter(fileName => fileName.endsWith('.tsx'))
  .map(fileName => path.join(tsxPath, fileName))

const cssFileName = fs
  .readdirSync(buildPath)
  .filter(fn => fn.endsWith('.css'))[0]
const cssFilePath = path.join(buildPath, cssFileName)

;(async () => {
  const result = await new PurgeCSS().purge({
    content: [htmlFilePath, ...tsxPathArr],
    css: [cssFilePath],
    extractors: [
      {
        extractor: purgecssFromHtml,
        extensions: ['html']
      }
    ]
  })

  fs.writeFileSync(cssFilePath, result[0].css)
})()
