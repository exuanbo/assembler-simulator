import type { Operand } from './parseOperand'
import { parseOperand } from './parseOperand'
import type { Statement } from '../tokenize'
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
  OperandType,
  REGISTER_CODE_MAP
} from '../constants'

// TODO test
export const getRegistorName = (registerCode: number): string => {
  const [registerName] = Object.entries(REGISTER_CODE_MAP)
    .map(([registerName, mappedCode]) => {
      if (mappedCode === registerCode) {
        return registerName
      }
      return undefined
    })
    .filter(excludeUndefined)

  return registerName
}

// TODO test
export const restoreOperand = (operand: Operand): string => {
  const hexValue = decToHex(operand.value)
  switch (operand.type) {
    case OperandType.Number:
      return `${hexValue}`
    case OperandType.Address:
      return `[${hexValue}]`
    case OperandType.Register:
      return getRegistorName(operand.value)
    case OperandType.RegisterPointer:
      return `[${getRegistorName(operand.value)}]`
  }
}

export const getMovOpcode = (
  target: Operand,
  src: Operand
): MovOpcode | never => {
  if (target.type === OperandType.Number) {
    throw new Error(
      `The first operand of MOV can not be number, but got ${restoreOperand(
        target
      )}`
    )
  }

  switch (target.type) {
    case OperandType.Register:
      switch (src.type) {
        case OperandType.Number:
          return 0xd0
        case OperandType.Address:
          return 0xd1
        case OperandType.RegisterPointer:
          return 0xd3
        case OperandType.Register:
        default:
          throw new Error(
            `The second operand of MOV can not be register, but got ${restoreOperand(
              src
            )}`
          )
      }
    case OperandType.Address:
    case OperandType.RegisterPointer:
      if (src.type === OperandType.Register) {
        return target.type === OperandType.Address ? 0xd2 : 0xd4
      }
      throw new Error(
        `The second operand of MOV must be register, but got ${restoreOperand(
          src
        )}`
      )
  }
}

export const getArithmeticOpcode = (
  token: ArithmeticInstruction,
  target: Operand,
  src: Operand | undefined
): ArithmeticOpcode | never => {
  if (target.type !== OperandType.Register) {
    throw new Error(
      `The first operand of ${token} must be register, but got ${restoreOperand(
        target
      )}`
    )
  }

  if (src === undefined) {
    return DIRECT_ARITHMETIC_OPCODE_MAP[token]
  }

  switch (src.type) {
    case OperandType.Register:
      return DIRECT_ARITHMETIC_OPCODE_MAP[token]
    case OperandType.Number:
      return IMMEDIATE_ARITHMETIC_OPCODE_MAP[
        token as ImmediateArithmeticInstruction
      ]
    case OperandType.Address:
    case OperandType.RegisterPointer:
      throw new Error(
        `The second operand of ${token} must be register or number, but got ${restoreOperand(
          src
        )}`
      )
  }
}

export const getCompareOpcode = (
  operand1: Operand,
  operand2: Operand
): CompareOpcode | never => {
  if (operand1.type !== OperandType.Register) {
    throw new Error(
      `The first operand of CMP must be register, but got ${restoreOperand(
        operand1
      )}`
    )
  }
  switch (operand2.type) {
    case OperandType.Register:
      return 0xda
    case OperandType.Number:
      return 0xdb
    case OperandType.Address:
      return 0xdc
    case OperandType.RegisterPointer:
      throw new Error(
        `The second operand of CMP can not be address with register, but got ${restoreOperand(
          operand2
        )}`
      )
  }
}

export const getOpcode = (
  instruction: Exclude<Instruction, 'END'>,
  operand1: Operand,
  operand2?: Operand
): number => {
  switch (instruction) {
    case Instruction.MOV:
      return getMovOpcode(operand1, operand2!)
    case Instruction.ADD:
    case Instruction.SUB:
    case Instruction.MUL:
    case Instruction.DIV:
    case Instruction.INC:
    case Instruction.DEC:
      return getArithmeticOpcode(instruction, operand1, operand2)
    case Instruction.CMP:
      return getCompareOpcode(operand1, operand2!)
    case Instruction.JMP:
    case Instruction.JZ:
    case Instruction.JNZ:
      return BRANCH_OPCODE_MAP[instruction]
  }
}

export const getOpcodesFromStatemet = (
  statement: Statement
): number[] | null => {
  const { instruction, operands } = statement
  if (instruction === Instruction.END) {
    return [0x00]
  }

  if (operands !== null) {
    const [operand1, operand2] = operands
    const parsedOperand1 = parseOperand(operand1)
    const parsedOperand2 =
      operand2 !== undefined ? parseOperand(operand2) : undefined

    const opcode = getOpcode(instruction, parsedOperand1, parsedOperand2)

    return [opcode, parsedOperand1.value, parsedOperand2?.value].filter(
      excludeUndefined
    )
  }

  return null
}
