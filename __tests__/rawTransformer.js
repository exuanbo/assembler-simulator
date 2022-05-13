module.exports = {
  process(sourceText) {
    return {
      code: `exports.default = ${JSON.stringify(sourceText)};`
    }
  }
}
