import type { Operand } from '../../src/core/assemble/parseOperand'
import {
  getOperandMatcher,
  parseOperand
} from '../../src/core/assemble/parseOperand'
import { OperandType, REGISTER_CODE_MAP } from '../../src/core/constants'

const HEX_NUMBERS = [0x00, 0x09, 0x1f]
const HEX_NUMBER_STRINGS = ['00', '09', '1F']
const INVALID_OPERANDS = ['001', 'el', '[el]', 'start']

describe('getOperandMatcher', () => {
  HEX_NUMBER_STRINGS.forEach((numString, index) => {
    it(`should get matcher for number '${numString}'`, () => {
      const exp: Operand = {
        type: OperandType.Number,
        value: HEX_NUMBERS[index]
      }
      const res = getOperandMatcher(numString)(OperandType.Number)
      expect(res).toStrictEqual(exp)
    })

    it(`should get matcher for address '[${numString}]'`, () => {
      const exp: Operand = {
        type: OperandType.Address,
        value: HEX_NUMBERS[index]
      }
      const res = getOperandMatcher(`[${numString}]`)(OperandType.Address)
      expect(res).toStrictEqual(exp)
    })
  })

  Object.entries(REGISTER_CODE_MAP).forEach(([registerName, registerCode]) => {
    it(`should get matcher for valid register '${registerName}'`, () => {
      const exp: Operand = {
        type: OperandType.Register,
        value: registerCode
      }
      const res = getOperandMatcher(registerName)(OperandType.Register)
      expect(res).toStrictEqual(exp)
    })

    it(`should get matcher for valid register pointer '[${registerName}]'`, () => {
      const exp: Operand = {
        type: OperandType.RegisterPointer,
        value: registerCode
      }
      const res = getOperandMatcher(`[${registerName}]`)(
        OperandType.RegisterPointer
      )
      expect(res).toStrictEqual(exp)
    })
  })

  INVALID_OPERANDS.forEach(operand => {
    Object.values(Object.values(OperandType)).forEach(operandType => {
      it(`should return null for invalid operand '${operand}'`, () => {
        const res = getOperandMatcher(operand)(operandType)
        expect(res).toBe(null)
      })
    })
  })
})

describe('parseOperand', () => {
  HEX_NUMBER_STRINGS.forEach((num, index) => {
    it(`should parse number '${num}'`, () => {
      const exp: Operand = {
        type: OperandType.Number,
        value: HEX_NUMBERS[index]
      }
      const res = parseOperand(num)
      expect(res).toStrictEqual(exp)
    })

    it(`should parse address '[${num}]'`, () => {
      const exp: Operand = {
        type: OperandType.Address,
        value: HEX_NUMBERS[index]
      }
      const res = parseOperand(`[${num}]`)
      expect(res).toStrictEqual(exp)
    })
  })

  Object.entries(REGISTER_CODE_MAP).forEach(([registorName, registerCode]) => {
    it(`should parse valid register '${registorName}'`, () => {
      const exp: Operand = {
        type: OperandType.Register,
        value: registerCode
      }
      const res = parseOperand(registorName)
      expect(res).toStrictEqual(exp)
    })

    it(`should parse valid register pointer '[${registorName}]'`, () => {
      const exp: Operand = {
        type: OperandType.RegisterPointer,
        value: registerCode
      }
      const res = parseOperand(`[${registorName}]`)
      expect(res).toStrictEqual(exp)
    })
  })

  INVALID_OPERANDS.forEach(operand => {
    it(`should parse '${operand}' and throw an error`, () => {
      expect.assertions(1)
      try {
        parseOperand(operand)
      } catch (err) {
        expect(err.message).toBe(`Invalid operand ${operand}`)
      }
    })
  })
})
