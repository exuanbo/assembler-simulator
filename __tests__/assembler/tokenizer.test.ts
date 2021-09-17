import { tokenize } from '../../src/features/assembler/core/tokenizer'

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
    expect(tokenize('[] [00] [al]')).toMatchSnapshot()
  })

  it('should tokenize string', () => {
    expect(tokenize('""\n"this is a string"')).toMatchSnapshot()
  })
})
