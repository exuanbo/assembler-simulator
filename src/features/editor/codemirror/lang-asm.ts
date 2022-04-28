import type { Extension } from '@codemirror/state'
import {
  StreamLanguage,
  LanguageSupport,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentUnit,
  indentService
} from '@codemirror/language'
import { Mnemonic, MnemonicToOperandCountMap } from '@/common/constants'

/* eslint-disable prettier/prettier */

const SKIPABLE_CHARACTER_REGEXP = /[,[\]:]/
const LABEL_DECLARATION_REGEXP =  /^[a-zA-Z_]+(?=:)/
const LABEL_REFERENCE_REGEXP =    /^[a-zA-Z_]+/
const MAYBE_INSTRUCTION_REGEXP =  /^[^\s;:,["]+/
const NUMBER_REGEXP =             /^[\da-fA-F]+\b/
const REGISTER_REGEXP =           /^[a-dA-D][lL]\b/
const NON_WHITESPACE_REGEXP =     /\S/

/* eslint-enable prettier/prettier */

interface State {
  ended: boolean
  operandsLeft: number
  expectLabel: boolean
}

const asmLanguage = StreamLanguage.define<State>({
  token(stream, state) {
    if (state.ended) {
      stream.skipToEnd()
      return 'comment'
    }

    /* eslint-disable @typescript-eslint/strict-boolean-expressions */

    if (stream.eatSpace() || stream.eat(SKIPABLE_CHARACTER_REGEXP)) {
      return null
    }

    if (stream.eat(';')) {
      stream.skipToEnd()
      return 'comment'
    }

    if (stream.match(LABEL_DECLARATION_REGEXP)) {
      state.operandsLeft = 0
      return 'labelName'
    }

    if (state.operandsLeft === 0) {
      const matched = (stream.match(MAYBE_INSTRUCTION_REGEXP) as RegExpMatchArray | null)?.[0]
      if (matched) {
        const upperCased = matched.toUpperCase()
        if (upperCased in Mnemonic) {
          const mnemonic = upperCased as Mnemonic
          if (mnemonic === Mnemonic.END) {
            state.ended = true
          }
          state.operandsLeft = MnemonicToOperandCountMap[mnemonic]
          state.expectLabel = mnemonic.startsWith('J')
          return 'keyword'
        } else {
          return null
        }
      }
    } /* if (state.operandsLeft > 0) */ else {
      if (stream.match(NUMBER_REGEXP)) {
        state.operandsLeft -= 1
        return 'number'
      }

      if (stream.match(REGISTER_REGEXP)) {
        state.operandsLeft -= 1
        return 'variableName.special'
      }

      if (stream.eat('"')) {
        stream.skipToEnd()
        const chars = stream.current()
        let lastQuoteIndex = 0
        for (let i = 1; i < chars.length; i++) {
          if (chars[i] === '"' && chars[i - 1] !== '\\') {
            lastQuoteIndex = i
            break
          }
        }
        const lastCharIndex = chars.length - 1
        if (lastQuoteIndex !== 0 && lastQuoteIndex !== lastCharIndex) {
          stream.backUp(lastCharIndex - lastQuoteIndex)
        }
        state.operandsLeft -= 1
        return 'string'
      }

      if (state.expectLabel && stream.match(LABEL_REFERENCE_REGEXP)) {
        state.operandsLeft -= 1
        state.expectLabel = false
        return 'labelName'
      }

      state.operandsLeft = 0
    }

    /* eslint-enable @typescript-eslint/strict-boolean-expressions */

    stream.eatWhile(NON_WHITESPACE_REGEXP)
    return null
  },

  startState() {
    return {
      ended: false,
      operandsLeft: 0,
      expectLabel: false
    }
  }
})

const LEADING_SPACE_REGEXP = /^ */
const LEADING_WHITESPACE_REGEXP = /^\s*/

export const asm = (): Extension => [
  new LanguageSupport(asmLanguage),
  syntaxHighlighting(defaultHighlightStyle),
  indentUnit.of('\t'),
  indentService.of(({ state }, pos) => {
    const trimmedLine = state.doc.lineAt(pos).text.replace(LEADING_SPACE_REGEXP, '')
    const whitespaces = LEADING_WHITESPACE_REGEXP.exec(trimmedLine)?.[0].split('') ?? []
    const tabCount = whitespaces.reduce((acc, char) => (char === '\t' ? acc + 1 : acc), 0)
    const spaceCount = whitespaces.length - tabCount
    return tabCount * state.tabSize + spaceCount
  })
]
