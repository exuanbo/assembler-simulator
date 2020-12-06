import { ArgType, REGISTER_CODE } from '../../src/core/constants'
import {
  ParsedArg,
  getArgMatcher,
  parseArg
} from '../../src/core/assemble/parseArg'

const HEX_NUMBERS = [0x00, 0x09, 0x1f]
const HEX_NUMBER_STRINGS = ['00', '09', '1F']
const INVALID_ARGS = ['001', 'el', '[el]', 'start']

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

  Object.entries(REGISTER_CODE).forEach(([registerName, registerCode]) => {
    it(`should get matcher for valid register '${registerName}'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Register,
        value: registerCode
      }
      const res = getArgMatcher(registerName)(ArgType.Register)
      expect(res).toStrictEqual(exp)
    })

    it(`should get matcher for valid register pointer '[${registerName}]'`, () => {
      const exp: ParsedArg = {
        type: ArgType.RegisterPointer,
        value: registerCode
      }
      const res = getArgMatcher(`[${registerName}]`)(ArgType.RegisterPointer)
      expect(res).toStrictEqual(exp)
    })
  })

  INVALID_ARGS.forEach(arg => {
    Object.values(Object.values(ArgType)).forEach(argType => {
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

  Object.entries(REGISTER_CODE).forEach(([registorName, registerCode]) => {
    it(`should parse valid register '${registorName}'`, () => {
      const exp: ParsedArg = {
        type: ArgType.Register,
        value: registerCode
      }
      const res = parseArg(registorName)
      expect(res).toStrictEqual(exp)
    })

    it(`should parse valid register pointer '[${registorName}]'`, () => {
      const exp: ParsedArg = {
        type: ArgType.RegisterPointer,
        value: registerCode
      }
      const res = parseArg(`[${registorName}]`)
      expect(res).toStrictEqual(exp)
    })
  })

  INVALID_ARGS.forEach(arg => {
    it(`should parse '${arg}' and throw an error`, () => {
      expect.assertions(1)
      try {
        parseArg(arg)
      } catch (err) {
        expect(err.message).toBe(`Invalid argument ${arg}`)
      }
    })
  })
})
