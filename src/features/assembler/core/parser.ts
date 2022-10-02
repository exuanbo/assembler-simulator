import type {
  SourceRange,
  MnemonicWithNoOperand,
  MnemonicWithOneOperand,
  MnemonicWithTwoOperands
} from './types'
import { TokenType, Token } from './tokenizer'
import {
  AssemblerError,
  InvalidLabelError,
  StatementError,
  MissingEndError,
  InvalidNumberError,
  InvalidStringError,
  AddressError,
  UnterminatedAddressError,
  UnterminatedStringError,
  SingleQuoteError,
  OperandTypeError,
  MissingCommaError
} from './exceptions'
import { GeneralPurposeRegister, GeneralPurposeRegisterName } from '@/features/cpu/core'
import { Mnemonic, MnemonicToOperandCountMap, Opcode } from '@/common/constants'
import { hexToDec, stringToAscii, call } from '@/common/utils'

interface BaseNode {
  range: SourceRange
}

export interface Label extends BaseNode {
  identifier: string
}

const createLabel = ({ value, range }: Token): Label => {
  return {
    identifier: value,
    range
  }
}

interface Instruction extends BaseNode {
  mnemonic: string
  opcode: Opcode | null | undefined
}

const createInstruction = ({ value, range }: Token): Instruction => {
  return {
    mnemonic: value,
    opcode: undefined,
    range
  }
}

export enum OperandType {
  Number = 'Number',
  Register = 'Register',
  Address = 'Address',
  RegisterAddress = 'RegisterAddress',
  String = 'String',
  Label = 'Label'
}

export interface Operand<T extends OperandType = OperandType> extends BaseNode {
  type: T
  value: number | number[] | undefined
  rawValue: string
  raw: string
}

const createOperand = <T extends OperandType>(type: T, token: Token): Operand<T> => {
  const value = call((): Operand['value'] => {
    switch (type) {
      case OperandType.Number:
      case OperandType.Address:
        return hexToDec(token.value)
      case OperandType.Register:
      case OperandType.RegisterAddress:
        return GeneralPurposeRegister[token.value as GeneralPurposeRegisterName]
      case OperandType.String:
        return stringToAscii(token.value)
      case OperandType.Label:
        return undefined
    }
  })
  const { value: rawValue, raw, range } = token
  return {
    type,
    value,
    rawValue,
    raw,
    range
  }
}

export interface Statement extends BaseNode {
  label: Label | null
  instruction: Instruction
  operands: Operand[]
  machineCode: number[]
}

const createStatement = (
  label: Label | null,
  instruction: Instruction,
  operands: Operand[]
): Statement => {
  // istanbul ignore next
  if (instruction.opcode === undefined) {
    throw new Error(`Opcode for instruction ${instruction.mnemonic} is undefined`)
  }
  const machineCode: number[] = []
  if (instruction.opcode !== null) {
    machineCode.push(instruction.opcode)
  }
  operands.forEach(operand => {
    if (operand.value !== undefined) {
      if (typeof operand.value === 'number') {
        machineCode.push(operand.value)
      } else {
        machineCode.push(...operand.value)
      }
    }
  })
  const from = instruction.range.from
  const lastNode = operands.length > 0 ? operands[operands.length - 1] : instruction
  const to = lastNode.range.to
  return {
    label,
    instruction,
    operands,
    machineCode,
    range: { from, to }
  }
}

const LABEL_REGEXP = /^[A-Z_]+$/

const validateLabel = (token: Token): Token => {
  if (!LABEL_REGEXP.test(token.value)) {
    throw new InvalidLabelError(token)
  }
  return token
}

const parseLabel = (tokens: Token[], index: number): Label | null => {
  if (tokens[index + 1]?.type !== TokenType.Colon) {
    return null
  }
  return createLabel(validateLabel(tokens[index]))
}

const validateNumber = (token: Token): Token => {
  if (hexToDec(token.value) > 0xff) {
    throw new InvalidNumberError(token)
  }
  return token
}

const validateString = (token: Token): Token => {
  const charCount = token.value.length
  for (let charIndex = 0; charIndex < charCount; charIndex++) {
    const charCode = token.value.charCodeAt(charIndex)
    if (charCode > 0xff) {
      throw new InvalidStringError(token, charIndex)
    }
  }
  return token
}

const NUMBER_REGEXP = /^[\dA-F]+$/
const REGISTER_REGEXP = /^[A-D]L$/

const parseSingleOperand =
  (tokens: Token[], index: number) =>
  <T extends OperandType>(...expectedTypes: T[]): Operand<T> => {
    if (index >= tokens.length) {
      throw new MissingEndError()
    }
    const token = tokens[index]

    let t: OperandType

    const isExpectedType = (type: OperandType): type is T =>
      (expectedTypes as OperandType[]).includes(type)

    switch (token.type) {
      case TokenType.Digits:
        if (isExpectedType((t = OperandType.Number))) {
          return createOperand(t, validateNumber(token))
        }
        break
      case TokenType.Register:
        if (isExpectedType((t = OperandType.Register))) {
          return createOperand(t, token)
        }
        break
      case TokenType.Address:
        if (isExpectedType(OperandType.Address) || isExpectedType(OperandType.RegisterAddress)) {
          if (isExpectedType((t = OperandType.Address))) {
            if (NUMBER_REGEXP.test(token.value)) {
              return createOperand(t, validateNumber(token))
            }
          }
          if (isExpectedType((t = OperandType.RegisterAddress))) {
            if (REGISTER_REGEXP.test(token.value)) {
              return createOperand(t, token)
            }
          }
          throw new AddressError(token)
        }
        break
      case TokenType.String:
        if (isExpectedType((t = OperandType.String))) {
          return createOperand(t, validateString(token))
        }
        break
      case TokenType.Unknown:
        if (token.raw.startsWith('[')) {
          throw new UnterminatedAddressError(token)
        }
        if (token.raw.startsWith('"')) {
          throw new UnterminatedStringError(token)
        }
        if (token.raw.startsWith("'")) {
          throw new SingleQuoteError(token)
        }
        if (isExpectedType((t = OperandType.Number))) {
          if (NUMBER_REGEXP.test(token.value)) {
            return createOperand(t, validateNumber(token))
          }
        } else if (isExpectedType((t = OperandType.Label))) {
          return createOperand(t, validateLabel(token))
        }
        break
    }
    throw new OperandTypeError(token, ...expectedTypes)
  }

const checkComma = (tokens: Token[], index: number): AssemblerError | null => {
  if (index >= tokens.length) {
    return new MissingEndError()
  }
  const token = tokens[index]
  if (token.type !== TokenType.Comma) {
    return new MissingCommaError(token)
  }
  return null
}

const parseDoubleOperands =
  (tokens: Token[], index: number) =>
  <T1 extends OperandType, T2 extends OperandType>(
    ...expectedTypePairs: Array<[firstOperandType: T1, secondOperandType: T2]>
  ): [firstOperand: Operand<T1>, secondOperand: Operand<T2>] => {
    const possibleFirstOperandTypes: T1[] = []
    expectedTypePairs.forEach(([firstOperandType]) => {
      if (!possibleFirstOperandTypes.includes(firstOperandType)) {
        possibleFirstOperandTypes.push(firstOperandType)
      }
    })
    const firstOperand = parseSingleOperand(tokens, index)(...possibleFirstOperandTypes)
    const error = checkComma(tokens, index + 1)
    if (error !== null) {
      throw error
    }
    const possibleSecondOperandTypes: T2[] = []
    expectedTypePairs.forEach(([firstOperandType, secondOperandType]) => {
      if (firstOperandType === firstOperand.type) {
        possibleSecondOperandTypes.push(secondOperandType)
      }
    })
    const secondOperand = parseSingleOperand(tokens, index + 2)(...possibleSecondOperandTypes)
    return [firstOperand, secondOperand]
  }

const parseStatement = (
  tokens: Token[],
  __index: number
): [statement: Statement, consumed: number] => {
  const getIndex = (): number => __index + consumedTokenCount

  let consumedTokenCount = 0
  const consumeToken = (count: number): void => {
    consumedTokenCount += count
  }

  const label = parseLabel(tokens, getIndex())
  const hasLabel = label !== null
  if (hasLabel) {
    consumeToken(2) // Label + Colon
  }

  const token = tokens[getIndex()]
  if (token === undefined) {
    throw new MissingEndError()
  }
  if (token.type !== TokenType.Unknown || !(token.value in Mnemonic)) {
    throw new StatementError(token, hasLabel)
  }
  consumeToken(1) // instruction

  const instruction = createInstruction(token)
  const setOpcode = (opcode: Opcode | null): void => {
    instruction.opcode = opcode
  }

  const operands: Operand[] = []
  const setOperands = (...parsedOperands: Operand[]): void => {
    operands.push(...parsedOperands)
  }

  const mnemonic = token.value as Mnemonic
  const operandCount = MnemonicToOperandCountMap[mnemonic]

  switch (operandCount) {
    case 0: {
      setOpcode(Opcode[mnemonic as MnemonicWithNoOperand])
      break
    }
    case 1: {
      let opcode, operand
      const parseOperand = parseSingleOperand(tokens, getIndex())

      switch (mnemonic as MnemonicWithOneOperand) {
        case Mnemonic.INC:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.INC_REG
          break
        case Mnemonic.DEC:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.DEC_REG
          break
        case Mnemonic.NOT:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.NOT_REG
          break
        case Mnemonic.ROL:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.ROL_REG
          break
        case Mnemonic.ROR:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.ROR_REG
          break
        case Mnemonic.SHL:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.SHL_REG
          break
        case Mnemonic.SHR:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.SHR_REG
          break
        case Mnemonic.JMP:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JMP
          break
        case Mnemonic.JZ:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JZ
          break
        case Mnemonic.JNZ:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JNZ
          break
        case Mnemonic.JS:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JS
          break
        case Mnemonic.JNS:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JNS
          break
        case Mnemonic.JO:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JO
          break
        case Mnemonic.JNO:
          operand = parseOperand(OperandType.Label)
          opcode = Opcode.JNO
          break
        case Mnemonic.PUSH:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.PUSH_FROM_REG
          break
        case Mnemonic.POP:
          operand = parseOperand(OperandType.Register)
          opcode = Opcode.POP_TO_REG
          break
        case Mnemonic.CALL:
          operand = parseOperand(OperandType.Number)
          opcode = Opcode.CALL_ADDR
          break
        case Mnemonic.INT:
          operand = parseOperand(OperandType.Number)
          opcode = Opcode.INT_ADDR
          break
        case Mnemonic.IN:
          operand = parseOperand(OperandType.Number)
          opcode = Opcode.IN_FROM_PORT_TO_AL
          break
        case Mnemonic.OUT:
          operand = parseOperand(OperandType.Number)
          opcode = Opcode.OUT_FROM_AL_TO_PORT
          break
        case Mnemonic.ORG:
          operand = parseOperand(OperandType.Number)
          opcode = null
          break
        case Mnemonic.DB:
          operand = parseOperand(OperandType.Number, OperandType.String)
          opcode = null
          break
      }

      setOpcode(opcode)
      setOperands(operand)
      consumeToken(1) // Operand
      break
    }
    case 2: {
      let opcode, firstOperand, secondOperand
      const parseOperands = parseDoubleOperands(tokens, getIndex())

      switch (mnemonic as MnemonicWithTwoOperands) {
        case Mnemonic.ADD:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.ADD_REG_TO_REG
              break
            case OperandType.Number:
              opcode = Opcode.ADD_IMM_TO_REG
              break
          }
          break
        case Mnemonic.SUB:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.SUB_REG_FROM_REG
              break
            case OperandType.Number:
              opcode = Opcode.SUB_IMM_FROM_REG
              break
          }
          break
        case Mnemonic.MUL:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.MUL_REG_BY_REG
              break
            case OperandType.Number:
              opcode = Opcode.MUL_REG_BY_IMM
              break
          }
          break
        case Mnemonic.DIV:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.DIV_REG_BY_REG
              break
            case OperandType.Number:
              opcode = Opcode.DIV_REG_BY_IMM
              break
          }
          break
        case Mnemonic.MOD:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.MOD_REG_BY_REG
              break
            case OperandType.Number:
              opcode = Opcode.MOD_REG_BY_IMM
              break
          }
          break
        case Mnemonic.AND:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.AND_REG_WITH_REG
              break
            case OperandType.Number:
              opcode = Opcode.AND_REG_WITH_IMM
              break
          }
          break
        case Mnemonic.OR:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.OR_REG_WITH_REG
              break
            case OperandType.Number:
              opcode = Opcode.OR_REG_WITH_IMM
              break
          }
          break
        case Mnemonic.XOR:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.XOR_REG_WITH_REG
              break
            case OperandType.Number:
              opcode = Opcode.XOR_REG_WITH_IMM
              break
          }
          break
        case Mnemonic.MOV:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Number],
            [OperandType.Register, OperandType.Address],
            [OperandType.Address, OperandType.Register],
            [OperandType.Register, OperandType.RegisterAddress],
            [OperandType.RegisterAddress, OperandType.Register]
          )
          switch (firstOperand.type) {
            case OperandType.Register:
              switch (secondOperand.type) {
                case OperandType.Number:
                  opcode = Opcode.MOV_IMM_TO_REG
                  break
                case OperandType.Address:
                  opcode = Opcode.MOV_VAL_FROM_ADDR_TO_REG
                  break
                case OperandType.RegisterAddress:
                  opcode = Opcode.MOV_VAL_FROM_REG_ADDR_TO_REG
                  break
                // istanbul ignore next
                default:
                  throw new Error('unreachable')
              }
              break
            case OperandType.Address:
              opcode = Opcode.MOV_REG_TO_ADDR
              break
            case OperandType.RegisterAddress:
              opcode = Opcode.MOV_REG_TO_REG_ADDR
          }
          break
        case Mnemonic.CMP:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number],
            [OperandType.Register, OperandType.Address]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              opcode = Opcode.CMP_REG_WITH_REG
              break
            case OperandType.Number:
              opcode = Opcode.CMP_REG_WITH_IMM
              break
            case OperandType.Address:
              opcode = Opcode.CMP_REG_WITH_VAL_FROM_ADDR
              break
          }
          break
      }

      setOpcode(opcode)
      setOperands(firstOperand, secondOperand)
      consumeToken(3) // Operand + Comma + Operand
      break
    }
  }

  const statement = createStatement(label, instruction, operands)
  return [statement, consumedTokenCount]
}

export const parse = (tokens: Token[]): Statement[] => {
  const statements: Statement[] = []
  for (let index = 0; index < tokens.length; ) {
    const [statement, consumed] = parseStatement(tokens, index)
    statements.push(statement)
    index += consumed
  }
  if (
    statements.length > 0 &&
    statements[statements.length - 1].instruction.mnemonic !== Mnemonic.END
  ) {
    throw new MissingEndError()
  }
  return statements
}
