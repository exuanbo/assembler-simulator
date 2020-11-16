import {
  generateAddressArr,
  getArithmeticOpcode,
  getMovOpcode,
  getOpcode
} from '../src/utils/assembler'
import {
  Keyword,
  ArithmeticKeyword,
  ArgType,
  OPCODE_MAPPING
} from '../src/utils/constants'

describe('generateAddressArr', () => {
  it('should generate address array', () => {
    const res = generateAddressArr(false)
    expect(res.length).toBe(0x100)
    expect(res[0xc0]).toBe(0x00)
  })

  it('should generate address array with VDU initialized', () => {
    const res = generateAddressArr(true)
    expect(res.length).toBe(0x100)
    expect(res[0xc0]).toBe(0x20)
    expect(res[0xff]).toBe(0x20)
  })
})

const arithmeticKeywords: ArithmeticKeyword[] = [
  Keyword.ADD,
  Keyword.SUB,
  Keyword.MUL,
  Keyword.DIV
]

describe('getArithmeticOpcode', () => {
  arithmeticKeywords.forEach(keyword => {
    it(`should works with '${keyword}' when 'src.type === ArgType.Register'`, () => {
      const res = getArithmeticOpcode(
        keyword,
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Register, value: 0x01 }
      )
      expect(res).toBe((OPCODE_MAPPING[keyword] as [number, number])[0])
    })

    it(`should works with '${keyword}' when 'src.type === ArgType.Number'`, () => {
      const res = getArithmeticOpcode(
        keyword,
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Number, value: 0x01 }
      )
      expect(res).toBe((OPCODE_MAPPING[keyword] as [number, number])[1])
    })

    it(`should return undefined with '${keyword}' if arg is invalid`, () => {
      const res = getArithmeticOpcode(
        keyword,
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Address, value: 0x01 }
      )
      expect(res).toBe(undefined)
    })
  })
})

describe('getMoveOpcode', () => {
  it('should works when move register <- number', () => {
    const res = getMovOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Number, value: 0x01 }
    )
    expect(res).toBe(0xd0)
  })

  it('should works when move register <- address', () => {
    const res = getMovOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Address, value: 0x01 }
    )
    expect(res).toBe(0xd1)
  })

  it('should works when move register <- registerPointer', () => {
    const res = getMovOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.RegisterPointer, value: 0x01 }
    )
    expect(res).toBe(0xd3)
  })

  it('should works when move address <- register', () => {
    const res = getMovOpcode(
      { type: ArgType.Address, value: 0x00 },
      { type: ArgType.Register, value: 0x01 }
    )
    expect(res).toBe(0xd2)
  })

  it('should works when move registerPointer <- register', () => {
    const res = getMovOpcode(
      { type: ArgType.RegisterPointer, value: 0x00 },
      { type: ArgType.Register, value: 0x01 }
    )
    expect(res).toBe(0xd4)
  })
})

describe('getOpcode', () => {
  arithmeticKeywords.forEach(keyword => {
    it(`should return correct opcode with '${keyword}'`, () => {
      const res = getOpcode(
        keyword,
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Register, value: 0x01 }
      )
      expect(res).toBe((OPCODE_MAPPING[keyword] as [number, number])[0])
    })
  })

  it("should return correct opcode with 'MOV'", () => {
    const res = getOpcode(
      Keyword.MOV,
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Number, value: 0x01 }
    )
    expect(res).toBe(0xd0)
  })
})
