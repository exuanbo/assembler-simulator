const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const purgecss = require('@fullhuman/postcss-purgecss')

const buildpath = path.join(__dirname, '../build')
const filename = fs.readdirSync(buildpath).filter(fn => fn.endsWith('.css'))[0]
const filepath = path.join(buildpath, filename)

const css = fs.readFileSync(filepath, 'utf-8')
const htmlpath = path.join(buildpath, 'index.html')

postcss([purgecss({ content: [htmlpath] })])
  .process(css, { from: filepath, to: filepath })
  .then(res => fs.writeFileSync(filepath, res.css))
