import type { Extension } from '@codemirror/state'
import { StreamLanguage } from '@codemirror/stream-parser'
import { LanguageSupport, indentUnit, indentService } from '@codemirror/language'
import { HighlightStyle, tags } from '@codemirror/highlight'
import { Mnemonic, MnemonicToOperandsCountMap } from '@/common/constants'

interface State {
  ended: boolean
  operandsLeft: number
  expectLabel: boolean
}

const asmLanguage = StreamLanguage.define<State>({
  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  token(stream, state) {
    if (state.ended) {
      stream.skipToEnd()
      return 'comment'
    }

    if (stream.eatSpace() || stream.eat(/[,[\]:]/)) {
      return null
    }

    if (stream.eat(';')) {
      stream.skipToEnd()
      return 'comment'
    }

    if (stream.match(/^[a-zA-Z_]+(?=:)/)) {
      state.operandsLeft = 0
      return 'labelName'
    }

    if (state.operandsLeft === 0) {
      const token = (stream.match(/^[^\s;:,"]+/) as RegExpMatchArray | null)?.[0]
      if (token === undefined) {
        stream.eatWhile(/\S/)
        return null
      }
      const upperCaseToken = token.toUpperCase()
      if (upperCaseToken in Mnemonic) {
        const mnemonic = upperCaseToken as Mnemonic
        if (mnemonic === Mnemonic.END) {
          state.ended = true
        }
        state.operandsLeft = MnemonicToOperandsCountMap[mnemonic]
        state.expectLabel = mnemonic.startsWith('J')
        return 'keyword'
      } else {
        return null
      }
    } else if (state.operandsLeft > 0) {
      if (stream.match(/^[\da-fA-F]+\b/)) {
        state.operandsLeft -= 1
        return 'number'
      }

      if (stream.match(/^[a-dA-D][lL]\b/)) {
        state.operandsLeft -= 1
        return 'variableName'
      }

      if (stream.eat('"')) {
        stream.skipToEnd()
        const tokens = stream.current()
        let lastQuoteIndex = 0
        for (let i = 1; i < tokens.length; i++) {
          if (tokens[i] === '"' && tokens[i - 1] !== '\\') {
            lastQuoteIndex = i
            break
          }
        }
        const lastCharIndex = tokens.length - 1
        if (lastQuoteIndex !== 0 && lastQuoteIndex !== lastCharIndex) {
          stream.backUp(lastCharIndex - lastQuoteIndex)
        }
        state.operandsLeft -= 1
        return 'string'
      }

      if (state.expectLabel && stream.match(/^[a-zA-Z_]+/)) {
        state.operandsLeft -= 1
        state.expectLabel = false
        return 'labelName'
      }

      state.operandsLeft = 0
    }

    stream.eatWhile(/\S/)
    return null
  },
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */

  startState() {
    return {
      ended: false,
      operandsLeft: 0,
      expectLabel: false
    }
  }
})

const highlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: '#940' },
  { tag: tags.number, color: '#164' },
  { tag: tags.variableName, color: '#00c' },
  { tag: tags.string, color: '#a11' },
  { tag: tags.labelName, color: '#219' },
  { tag: tags.keyword, color: '#708' }
])

const LEADING_SPACE_REGEXP = /^ */
const LEADING_WHITESPACE_REGEXP = /^\s*/

export const asm = (): Extension => [
  new LanguageSupport(asmLanguage),
  highlightStyle,
  indentUnit.of('\t'),
  indentService.of(({ state }, pos) => {
    const trimmedLine = state.doc.lineAt(pos).text.replace(LEADING_SPACE_REGEXP, '')
    const whitespaces = LEADING_WHITESPACE_REGEXP.exec(trimmedLine)?.[0].split('') ?? []
    const tabsCount = whitespaces.reduce((acc, char) => (char === '\t' ? acc + 1 : acc), 0)
    const spacesCount = whitespaces.length - tabsCount
    return tabsCount * state.tabSize + spacesCount
  })
]
