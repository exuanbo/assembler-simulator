const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const purgecss = require('@fullhuman/postcss-purgecss')

const rootpath = process.cwd()
const tsxpath = path.join(rootpath, 'src/components')
const buildpath = path.join(rootpath, 'build')

const filename = fs.readdirSync(buildpath).filter(fn => fn.endsWith('.css'))[0]
const filepath = path.join(buildpath, filename)

const css = fs.readFileSync(filepath, 'utf-8')

const html = path.join(buildpath, 'index.html')
const tsxArr = fs
  .readdirSync(tsxpath)
  .filter(fn => fn.endsWith('.tsx'))
  .map(fn => path.join(tsxpath, fn))

postcss([purgecss({ content: [html, ...tsxArr] })])
  .process(css)
  .then(res => fs.writeFileSync(filepath, res.css))
