import { ArgType, REGISTER_CODE } from '../src/utils/constants'
import {
  strToHex,
  getRegisterCode,
  ParsedArg,
  getArgMatcher,
  parseArg
} from '../src/utils/parseArg'
import { omit } from '../src/utils/helper'

const HEX_NUMBERS = [0x00, 0x09, 0x1f]
const HEX_NUMBER_STRINGS = ['00', '09', '1F']
const INVALID_ARGS = ['001', 'el', '[el]', 'start']

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

describe('getMatcher', () => {
  HEX_NUMBER_STRINGS.forEach((numString, index) => {
    it(`should get matcher for number '${numString}'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Number,
        value: HEX_NUMBERS[index]
      }
      const res = getArgMatcher(numString)(ArgType.Number)
      expect(res).toStrictEqual(exp)
    })

    it(`should get matcher for address '[${numString}]'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Address,
        value: HEX_NUMBERS[index]
      }
      const res = getArgMatcher(`[${numString}]`)(ArgType.Address)
      expect(res).toStrictEqual(exp)
    })
  })

  Object.keys(REGISTER_CODE).forEach(registor => {
    it(`should get matcher for valid register '${registor}'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Register,
        value: getRegisterCode(registor)
      }
      const res = getArgMatcher(registor)(ArgType.Register)
      expect(res).toStrictEqual(exp)
    })

    it(`should get matcher for valid register pointer '[${registor}]'`, () => {
      const exp: ParsedArg = {
        type: ArgType.RegisterPointer,
        value: getRegisterCode(registor)
      }
      const res = getArgMatcher(`[${registor}]`)(ArgType.RegisterPointer)
      expect(res).toStrictEqual(exp)
    })
  })

  INVALID_ARGS.forEach(arg => {
    Object.values(Object.values(omit(ArgType, 'Invalid'))).forEach(argType => {
      it(`should return undefined for invalid arg '${arg}'`, () => {
        const res = getArgMatcher(arg)(argType)
        expect(res).toBe(undefined)
      })
    })
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

  INVALID_ARGS.forEach(arg => {
    it(`should parse '${arg}' and throw an error`, () => {
      expect.assertions(1)
      try {
        parseArg(arg)
      } catch (err) {
        expect(err.message).toBe(`Invalid argument '${arg}'`)
      }
    })
  })
})
