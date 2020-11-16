import { ArgType, REGISTER_CODE } from '../src/utils/constants'
import {
  strToHex,
  getRegisterCode,
  ParsedArg,
  parseArg
} from '../src/utils/parseArg'

const HEX_NUMBERS = [0x00, 0x09, 0x1f]
const HEX_NUMBER_STRINGS = ['00', '09', '1F']
const ILLEGAL_ARGS = ['001', 'el', '[el]']
const PARSED_ILLEGAL_ARG: ParsedArg = {
  type: ArgType.Illegal,
  value: undefined
}

describe('util functions', () => {
  HEX_NUMBER_STRINGS.forEach((num, index) => {
    it(`should turn string '${num}' to corresponding hex number`, () => {
      expect(strToHex(num)).toBe(HEX_NUMBERS[index])
    })
  })

  it('should return NaN if given string is not a hex number', () => {
    expect(strToHex('not_a_hex_number')).toBe(NaN)
  })

  Object.entries(REGISTER_CODE).forEach(([register, code]) => {
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
        type: ArgType.Number,
        value: HEX_NUMBERS[index]
      }
      const res = parseArg(num)
      expect(res).toStrictEqual(exp)
    })

    it(`should parse address '[${num}]'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Address,
        value: HEX_NUMBERS[index]
      }
      const res = parseArg(`[${num}]`)
      expect(res).toStrictEqual(exp)
    })
  })

  Object.keys(REGISTER_CODE).forEach(registor => {
    it(`should parse valid register '${registor}'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Register,
        value: getRegisterCode(registor)
      }
      const res = parseArg(registor)
      expect(res).toStrictEqual(exp)
    })

    it(`should parse valid register pointer '[${registor}]'`, () => {
      const exp: ParsedArg = {
        type: ArgType.RegisterPointer,
        value: getRegisterCode(registor)
      }
      const res = parseArg(`[${registor}]`)
      expect(res).toStrictEqual(exp)
    })
  })

  ILLEGAL_ARGS.forEach(arg => {
    it(`should parse '${arg}' return illegal arg`, () => {
      expect(parseArg(arg)).toStrictEqual(PARSED_ILLEGAL_ARG)
    })
  })
})
