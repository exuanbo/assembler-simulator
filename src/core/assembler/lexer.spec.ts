import { describe, expect, it } from 'vitest'

import { createLexer } from './lexer'
import { TokenType } from './token'

function tokenize(input: string) {
  const lexer = createLexer(input)
  return Array.from(lexer)
}

describe('lexer', () => {
  // Basic functionality
  it('should handle empty input', () => {
    const input = ''
    const tokens = tokenize(input)
    expect(tokens).toEqual([{ type: TokenType.EOI, value: '', loc: expect.any(Object) }])
  })

  it('should tokenize basic types', () => {
    const input = '123 abc label: "string" ; comment'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.Number, value: '123' },
      { type: TokenType.Identifier, value: 'abc' },
      { type: TokenType.LabelIdentifier, value: 'label' },
      { type: TokenType.Colon, value: ':' },
      { type: TokenType.String, value: '"string"' },
      { type: TokenType.Comment, value: '; comment' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  // Specific token types
  it('should tokenize special characters', () => {
    const input = '[1, 2, 3]'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.LeftSquare, value: '[' },
      { type: TokenType.Number, value: '1' },
      { type: TokenType.Comma, value: ',' },
      { type: TokenType.Number, value: '2' },
      { type: TokenType.Comma, value: ',' },
      { type: TokenType.Number, value: '3' },
      { type: TokenType.RightSquare, value: ']' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  it('should handle numbers and identifiers correctly', () => {
    const input = '123abc 456 def'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.Identifier, value: '123abc' },
      { type: TokenType.Number, value: '456' },
      { type: TokenType.Identifier, value: 'def' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  it('should handle immediate values correctly', () => {
    const input = 'ldr r0, 1234'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.Identifier, value: 'ldr' },
      { type: TokenType.Identifier, value: 'r0' },
      { type: TokenType.Comma, value: ',' },
      { type: TokenType.Number, value: '1234' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  // Whitespace and comments
  it('should handle whitespace and newlines correctly', () => {
    const input = '  abc  \n  123  \t  '
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.Identifier, value: 'abc' },
      { type: TokenType.Number, value: '123' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  it('should handle comments at the end of input', () => {
    const input = 'abc 123 ; comment without newline'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.Identifier, value: 'abc' },
      { type: TokenType.Number, value: '123' },
      { type: TokenType.Comment, value: '; comment without newline' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  // String handling
  it('should handle escaped characters in strings with correct locations', () => {
    const input = '"Hello \\"World\\"\\n\\t\\\\!"'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.String, value: '"Hello \\"World\\"\\n\\t\\\\!"' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  // Complex scenarios
  it('should tokenize mixed input correctly', () => {
    const input = 'mov r0, 42 ; Load 42 into r0'
    const tokens = tokenize(input)
    expect(tokens).toMatchObject([
      { type: TokenType.Identifier, value: 'mov' },
      { type: TokenType.Identifier, value: 'r0' },
      { type: TokenType.Comma, value: ',' },
      { type: TokenType.Number, value: '42' },
      { type: TokenType.Comment, value: '; Load 42 into r0' },
      { type: TokenType.EOI, value: '' },
    ])
  })

  // Error cases
  it('should throw an error for unexpected characters', () => {
    const input = 'abc @ def'
    expect(() => tokenize(input)).toThrow('Unexpected character')
  })

  it('should throw an error for unterminated strings', () => {
    const input = '"Unterminated string'
    expect(() => tokenize(input)).toThrow('Unterminated string')
  })

  it('should throw an error for unterminated strings with newline', () => {
    const input = '"Unterminated string\nwith newline'
    expect(() => tokenize(input)).toThrow('Unterminated string')
  })
})
