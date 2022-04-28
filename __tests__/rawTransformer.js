module.exports = {
  process(sourceText) {
    return `module.exports = { default: ${JSON.stringify(sourceText)} };`
  }
}
