import { tokenize } from '../../src/core/assembler'

describe('tokenizer', () => {
  it('should skip whitespace', () => {
    expect(tokenize(' \t\n' + 'done:' + ' \t\n' + 'end')).toMatchSnapshot()
  })

  it('should skip line with comment', () => {
    expect(tokenize('; this is a comment' + '\n' + 'end')).toMatchSnapshot()
  })

  it('should skip comment at the end of the line', () => {
    expect(
      tokenize('done:' + '; this is a comment' + '\n' + 'end' + '; this is another comment')
    ).toMatchSnapshot()
  })

  it('should tokenize comma', () => {
    expect(tokenize(',' + '\n' + ',,')).toMatchSnapshot()
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
    expect(tokenize('"" "this is a string"')).toMatchSnapshot()
  })
})
