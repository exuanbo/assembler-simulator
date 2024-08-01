// @ts-check
/** @typedef {import('@jest/transform').Transformer} Transformer */

/** @type {Transformer} */
const rawTransformer = {
  process(sourceText) {
    return {
      code: `exports.default = ${JSON.stringify(sourceText)};`,
    }
  },
}

export default rawTransformer
