import { createTokenizer, type Token } from '@/features/assembler/core/tokenizer'

import { shortArraySerializer } from '../../snapshotSerializers'

expect.addSnapshotSerializer(shortArraySerializer)

const tokenize = (source: string): Token[] => {
  const tokenizer = createTokenizer(source)
  const tokens: Token[] = []
  while (tokenizer.hasMore()) {
    tokens.push(tokenizer.consume())
  }
  return tokens
}

describe('tokenizer', () => {
  it('should skip whitespace', () => {
    expect(tokenize(' \t\ndone: \t\nend')).toMatchSnapshot()
  })

  it('should skip line with comment', () => {
    expect(tokenize('; this is a comment\nend')).toMatchSnapshot()
  })

  it('should skip comment at the end of the line', () => {
    expect(tokenize('done:; this is a comment\nend; this is another comment')).toMatchSnapshot()
  })

  it('should tokenize comma', () => {
    expect(tokenize(',\n,,')).toMatchSnapshot()
  })

  it('should tokenize digits', () => {
    expect(tokenize('0 01 002')).toMatchSnapshot()
  })

  it('should tokenize register', () => {
    expect(tokenize('al Bl cL DL')).toMatchSnapshot()
  })

  it('should tokenize address', () => {
    expect(tokenize('[] [00][al] [ Bl  ]')).toMatchSnapshot()
  })

  it('should throw UnterminatedAddressError when tokenizing address if closing bracket is missing', () => {
    expect(() => {
      tokenize('[00')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated address '[00'."`)

    expect(() => {
      tokenize('[al\n')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated address '[al'."`)

    expect(() => {
      tokenize('[Bl ')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated address '[Bl'."`)

    expect(() => {
      tokenize('[cL \n')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated address '[cL'."`)

    expect(() => {
      tokenize('[ DL ;')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated address '[ DL'."`)
  })

  it('should tokenize string', () => {
    expect(tokenize('"" "this is a string" "\\"" "\\n"')).toMatchSnapshot()
  })

  it('should remove invalid escape', () => {
    expect(tokenize('"f\\o\\o"')).toMatchSnapshot()
    expect(tokenize('"\\0\\u1"')).toMatchSnapshot()
  })

  it('should throw UnterminatedStringError when tokenizing string if closing quote is missing', () => {
    expect(() => {
      tokenize('"\\"')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated string '\\"\\\\\\\\\\"'."`)

    expect(() => {
      tokenize('"foo\nbar"')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated string '\\"foo'."`)
  })

  it('should throw Error when tokenizing unsupported character', () => {
    expect(() => {
      tokenize('!')
    }).toThrowErrorMatchingInlineSnapshot(`"Unexpected character '!'."`)
  })
})
