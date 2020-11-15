import { REGISTER_CODES } from '../src/utils/constants'
import {
  strToHex,
  getRegisterCode,
  ParsedArg,
  parseArg
} from '../src/utils/parseArg'

const HEX_NUMBERS = [0x00, 0x09, 0x1f]
const HEX_NUMBER_STRINGS = ['00', '09', '1F']
const ILLEGAL_ARGS = ['001', 'el', '[el]']
const PARSED_ILLEGAL_ARG: ParsedArg = { type: 'Illegal', value: null }

describe('util functions', () => {
  HEX_NUMBER_STRINGS.forEach((num, index) => {
    it(`should turn string '${num}' to corresponding hex number`, () => {
      expect(strToHex(num)).toBe(HEX_NUMBERS[index])
    })
  })

  it('should return NaN if given string is not a hex number', () => {
    expect(strToHex('not_a_hex_number')).toBe(NaN)
  })

  Object.entries(REGISTER_CODES).forEach(([register, code]) => {
    it(`should get register '${register}' code`, () => {
      expect(getRegisterCode(register)).toBe(code)
    })
  })

  it('should return undefined if given string is not a register name', () => {
    expect(getRegisterCode('not_a_register_name')).toBe(undefined)
  })
})

describe('parseArg', () => {
  HEX_NUMBER_STRINGS.forEach((num, index) => {
    it(`should parse number '${num}'`, () => {
      const exp: ParsedArg = {
        type: 'Number',
        value: HEX_NUMBERS[index]
      }
      const res = parseArg(num)
      expect(res).toEqual(exp)
    })

    it(`should parse address '[${num}]'`, () => {
      const exp: ParsedArg = {
        type: 'Address',
        value: HEX_NUMBERS[index]
      }
      const res = parseArg(`[${num}]`)
      expect(res).toEqual(exp)
    })
  })

  Object.keys(REGISTER_CODES).forEach(registor => {
    it(`should parse valid register '${registor}'`, () => {
      const exp: ParsedArg = {
        type: 'Register',
        value: getRegisterCode(registor)
      }
      const res = parseArg(registor)
      expect(res).toEqual(exp)
    })

    it(`should parse valid register pointer '[${registor}]'`, () => {
      const exp: ParsedArg = {
        type: 'RegisterPointer',
        value: getRegisterCode(registor)
      }
      const res = parseArg(`[${registor}]`)
      expect(res).toEqual(exp)
    })
  })

  ILLEGAL_ARGS.forEach(arg => {
    it(`should parse '${arg}' return illegal arg`, () => {
      expect(parseArg(arg)).toEqual(PARSED_ILLEGAL_ARG)
    })
  })
})
