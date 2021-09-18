/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { StreamLanguage } from '@codemirror/stream-parser'
import { LanguageSupport } from '@codemirror/language'
import { Mnemonic, MnemonicToOperandsCountMap } from '../../../common/constants'

const MNEMONIC_REGEXP = new RegExp(
  `^(?:${Object.keys(Mnemonic)
    .map(mnemonic =>
      mnemonic
        .split('')
        .map(char => `[${char.toLowerCase()}${char}]`)
        .join('')
    )
    .join('|')})\\b`
)

const AsmLanguage = StreamLanguage.define<{ operandsLeft: number; expectLabel: boolean }>({
  token(stream, state) {
    if (stream.eatSpace() || stream.eat(/[,[\]:]/)) {
      return null
    }

    if (stream.eat(';')) {
      stream.skipToEnd()
      return 'lineComment'
    }

    if (stream.match(/^[a-zA-Z_]+(?=:)/)) {
      return 'labelName'
    }

    if (state.operandsLeft <= 0 && stream.match(MNEMONIC_REGEXP)) {
      const mnemonic = stream.current().toUpperCase() as Mnemonic
      state.operandsLeft = MnemonicToOperandsCountMap[mnemonic]
      state.expectLabel = mnemonic.startsWith('J')
      return 'keyword'
    }

    if (stream.match(/^(?:[\da-fA-F]+|[a-dA-D][lL])\b/)) {
      state.operandsLeft -= 1
      return 'number'
    }

    if (stream.match(/^".*"/)) {
      state.operandsLeft -= 1
      return 'string'
    }

    if (state.expectLabel && stream.match(/^[a-zA-Z_]+/)) {
      state.operandsLeft -= 1
      state.expectLabel = false
      return 'labelName'
    }

    stream.eatWhile(/\S+/)
    return null
  },
  startState() {
    return {
      operandsLeft: 0,
      expectLabel: false
    }
  }
})

export const Asm = (): LanguageSupport => {
  return new LanguageSupport(AsmLanguage)
}
