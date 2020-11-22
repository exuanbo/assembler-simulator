import { Statement, TokenizeResult } from './tokenize'
import { ParsedArg, parseArg } from './parseArg'
import { excludeUndefined } from './helper'
import {
  Keyword,
  ArithmeticKeyword,
  StaticOpcodeKeyword,
  OPCODE_MAPPING,
  ArgType
} from './constants'

export const generateAddressArr = (withVDU: boolean): number[] =>
  Array(0x100)
    .fill(undefined)
    .map((_, index) => (withVDU && index >= 0xc0 ? 0x20 : 0x00))

type MovOpcode = 0xd0 | 0xd1 | 0xd3 | 0xd2 | 0xd4 | undefined

export const getMovOpcode = (dest: ParsedArg, src: ParsedArg): MovOpcode => {
  switch (dest.type) {
    case ArgType.Register:
      switch (src.type) {
        case ArgType.Number:
          return 0xd0
        case ArgType.Address:
          return 0xd1
        case ArgType.RegisterPointer:
          return 0xd3
      }
      break

    case ArgType.Address:
      if (src.type === ArgType.Register) {
        return 0xd2
      }
      break

    case ArgType.RegisterPointer:
      if (src.type === ArgType.Register) {
        return 0xd4
      }
  }
}

type GetOpcodeResult = number | undefined

export const getArithmeticOpcode = (
  token: ArithmeticKeyword,
  dest: ParsedArg,
  src: ParsedArg
): GetOpcodeResult => {
  switch (dest.type) {
    case ArgType.Register:
      switch (src.type) {
        case ArgType.Register:
          return (OPCODE_MAPPING[token] as [number, number])[0]
        case ArgType.Number:
          return (OPCODE_MAPPING[token] as [number, number])[1]
      }
  }
}

type CompareOpcode = 0xda | 0xdc | 0xdb | undefined

export const getCompareOpcode = (
  arg1: ParsedArg,
  arg2: ParsedArg
): CompareOpcode => {
  switch (arg1.type) {
    case ArgType.Register:
      switch (arg2.type) {
        case ArgType.Register:
          return 0xda
        case ArgType.Address:
          return 0xdc
        case ArgType.Number:
          return 0xdb
      }
  }
}

export const getStaticOpcode = (keyword: StaticOpcodeKeyword): number =>
  OPCODE_MAPPING[Keyword[keyword]] as number

export const getOpcode = (
  token: Keyword | string,
  arg1: ParsedArg,
  arg2?: ParsedArg
): GetOpcodeResult => {
  if (arg2 === undefined) {
    switch (token) {
      case Keyword.INC:
        return getStaticOpcode(Keyword.INC)
      case Keyword.DEC:
        return getStaticOpcode(Keyword.DEC)
      case Keyword.JMP:
        return getStaticOpcode(Keyword.JMP)
      case Keyword.JZ:
        return getStaticOpcode(Keyword.JZ)
      case Keyword.JNZ:
        return getStaticOpcode(Keyword.JNZ)
    }
    return
  }

  switch (token) {
    case Keyword.MOV:
      return getMovOpcode(arg1, arg2)
    case Keyword.ADD:
    case Keyword.SUB:
    case Keyword.MUL:
    case Keyword.DIV:
      return getArithmeticOpcode(token, arg1, arg2)
    case Keyword.CMP:
      return getCompareOpcode(arg1, arg2)
  }
}

const isIllegal = (arg: ParsedArg | undefined): boolean =>
  arg !== undefined && arg.type === ArgType.Illegal

export type GenerateOpcodesFromStatementResult = number[] | undefined

export const generateOpcodesFromStatement = (
  statement: Statement
): GenerateOpcodesFromStatementResult => {
  const { key, args } = statement
  if (key === Keyword.END) {
    return [0x00]
  }

  if (args !== undefined) {
    const [arg1, arg2] = args
    const parsedArg1 = parseArg(arg1)
    const parsedArg2 = (arg2 !== undefined && parseArg(arg2)) || undefined

    ;[parsedArg1, parsedArg2].forEach(arg => {
      if (isIllegal(arg)) {
        throw new Error(`Illegal argument '${(arg as ParsedArg).value}'`)
      }
    })

    const opcode = getOpcode(key, parsedArg1, parsedArg2)

    return [
      opcode,
      parsedArg1.value as number,
      parsedArg2?.value as number
    ].filter(excludeUndefined)
  }

  return undefined
}

export const assemble = (tokenizedCode: TokenizeResult): number[] => {
  const { statements } = tokenizedCode

  const address = generateAddressArr(true)
  let addressPos = 0

  statements.forEach(statement => {
    try {
      const opcodes = generateOpcodesFromStatement(statement)
      if (opcodes !== undefined) {
        opcodes.forEach(opcode => {
          address[addressPos] = opcode
          addressPos++
        })
      }
    } catch (err) {
      console.log((err as Error).message)
    }
  })

  return address
}
