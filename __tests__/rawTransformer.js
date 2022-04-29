module.exports = {
  process(sourceText) {
    return `exports.default = ${JSON.stringify(sourceText)};`
  }
}
