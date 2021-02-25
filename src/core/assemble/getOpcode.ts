import type { ParsedArg } from './parseArg'
import { excludeUndefined, decToHex } from '../utils'
import type {
  MovOpcode,
  ArithmeticInstruction,
  ArithmeticOpcode,
  ImmediateArithmeticInstruction,
  CompareOpcode
} from '../constants'
import {
  Instruction,
  DIRECT_ARITHMETIC_OPCODE_MAP,
  IMMEDIATE_ARITHMETIC_OPCODE_MAP,
  BRANCH_OPCODE_MAP,
  ArgType,
  REGISTER_CODE
} from '../constants'

// TODO test
export const getRegistorName = (registerCode: number): string => {
  const registerName = Object.entries(REGISTER_CODE)
    .map(([name, code]) => {
      if (code === registerCode) {
        return name
      }
      return undefined
    })
    .filter(excludeUndefined)[0]
  return registerName
}

// TODO test
export const restoreArg = (arg: ParsedArg): string => {
  const hexValue = decToHex(arg.value)
  switch (arg.type) {
    case ArgType.Number:
      return `${hexValue}`
    case ArgType.Address:
      return `[${hexValue}]`
    case ArgType.Register:
      return getRegistorName(arg.value)
    case ArgType.RegisterPointer:
      return `[${getRegistorName(arg.value)}]`
  }
}

export const getMovOpcode = (
  dest: ParsedArg,
  src: ParsedArg
): MovOpcode | never => {
  if (dest.type === ArgType.Number) {
    throw new Error(
      `The first argument of MOV can not be number. Got ${restoreArg(dest)}`
    )
  }
  switch (dest.type) {
    case ArgType.Register:
      switch (src.type) {
        case ArgType.Number:
          return 0xd0
        case ArgType.Address:
          return 0xd1
        case ArgType.RegisterPointer:
          return 0xd3
        case ArgType.Register:
        default:
          throw new Error(
            `The second argument of MOV can not be register. Got ${restoreArg(
              src
            )}`
          )
      }
    case ArgType.Address:
    case ArgType.RegisterPointer:
      if (src.type === ArgType.Register) {
        return dest.type === ArgType.Address ? 0xd2 : 0xd4
      }
      throw new Error(
        `The second argument of MOV must be register. Got ${restoreArg(src)}`
      )
  }
}

export const getArithmeticOpcode = (
  token: ArithmeticInstruction,
  dest: ParsedArg,
  src: ParsedArg | undefined
): ArithmeticOpcode | never => {
  if (dest.type !== ArgType.Register) {
    throw new Error(
      `The first argument of ${token} must be register. Got ${restoreArg(dest)}`
    )
  }

  if (src === undefined) {
    return DIRECT_ARITHMETIC_OPCODE_MAP[token]
  }

  switch (src.type) {
    case ArgType.Register:
      return DIRECT_ARITHMETIC_OPCODE_MAP[token]
    case ArgType.Number:
      return IMMEDIATE_ARITHMETIC_OPCODE_MAP[
        token as ImmediateArithmeticInstruction
      ]
    case ArgType.Address:
    case ArgType.RegisterPointer:
      throw new Error(
        `The second argument of ${token} must be register or number. Got ${restoreArg(
          src
        )}`
      )
  }
}

export const getCompareOpcode = (
  arg1: ParsedArg,
  arg2: ParsedArg
): CompareOpcode | never => {
  if (arg1.type !== ArgType.Register) {
    throw new Error(
      `The first argument of CMP must be register. Got ${restoreArg(arg1)}`
    )
  }
  switch (arg2.type) {
    case ArgType.Register:
      return 0xda
    case ArgType.Number:
      return 0xdb
    case ArgType.Address:
      return 0xdc
    case ArgType.RegisterPointer:
      throw new Error(
        `The second argument of CMP can not be address with register. Got ${restoreArg(
          arg2
        )}`
      )
  }
}

export const getOpcode = (
  instruction: Exclude<Instruction, 'END'>,
  arg1: ParsedArg,
  arg2?: ParsedArg
): number => {
  switch (instruction) {
    case Instruction.MOV:
      return getMovOpcode(arg1, arg2!)
    case Instruction.ADD:
    case Instruction.SUB:
    case Instruction.MUL:
    case Instruction.DIV:
    case Instruction.INC:
    case Instruction.DEC:
      return getArithmeticOpcode(instruction, arg1, arg2)
    case Instruction.CMP:
      return getCompareOpcode(arg1, arg2!)
    case Instruction.JMP:
    case Instruction.JZ:
    case Instruction.JNZ:
      return BRANCH_OPCODE_MAP[instruction]
  }
}
