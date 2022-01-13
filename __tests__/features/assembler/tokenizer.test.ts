import { tokenize } from '../../../src/features/assembler/core/tokenizer'
import { shortArraySerializer } from '../../snapshotSerializers'

expect.addSnapshotSerializer(shortArraySerializer)

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
    expect(tokenize('"" "this is a string" "\\"" "\\n"')).toMatchSnapshot()
  })

  it('should emit token with type `Unknown` if closing quote is missing', () => {
    expect(tokenize('"\\"')[0].type).toBe('Unknown')
  })

  it('should tokenize string with missing ending quote', () => {
    expect(tokenize('"Hello, World done: ;comment')).toMatchSnapshot()
  })
})
