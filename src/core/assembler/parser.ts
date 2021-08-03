import type { Token } from './tokenizer'
import { TokenType } from './tokenizer'
import {
  InvalidLabelError,
  StatementError,
  MissingEndError,
  AddressError,
  InvalidNumberError,
  OperandTypeError,
  MissingCommaError
} from './exceptions'
import { hexToDec, stringToASCII } from '../utils'
import type { MnemonicWithOneOperand, MnemonicWithTwoOperands } from '../constants'
import {
  Mnemonic,
  MNEMONIC_TO_OPERANDS_COUNT_MAP,
  Opcode,
  Register,
  REGISTER_TO_MACHINE_CODE_MAP
} from '../constants'

export interface Label {
  identifier: string
  token: Token
}

const createLabel = (token: Token): Label => {
  const identifier = token.value.slice(0, -1)
  return {
    identifier,
    token
  }
}

interface Instruction {
  mnemonic: Mnemonic
  opcode: Opcode | null
  token: Token
}

const createInstruction = (mnemonic: Mnemonic, token: Token): Instruction => ({
  mnemonic,
  opcode: null,
  token
})

export enum OperandType {
  Number = 'NUMBER',
  Register = 'REGISTER',
  Address = 'ADDRESS',
  RegisterAddress = 'REGISTER_ADDRESS',
  String = 'STRING',
  Label = 'LABEL'
}

interface Operand<T extends OperandType = OperandType> {
  type: T
  value: number | number[] | undefined
  token: Token
}

const createOperand = <T extends OperandType>(type: T, token: Token): Operand<T> => {
  const value = ((): Operand['value'] => {
    switch (type) {
      case OperandType.Number:
      case OperandType.Address:
        return hexToDec(token.value)
      case OperandType.Register:
      case OperandType.RegisterAddress:
        return REGISTER_TO_MACHINE_CODE_MAP[token.value as Register]
      case OperandType.String:
        return stringToASCII(token.value)
      case OperandType.Label:
        return undefined
    }
  })()
  return {
    type,
    value,
    token
  }
}

export interface Statement {
  label: Label | null
  instruction: Instruction
  operands: Operand[]
  machineCodes: number[]
  position: number
  length: number
}

const createStatement = (
  label: Label | null,
  instruction: Instruction,
  operands: Operand[]
): Statement => {
  const machineCodes = (instruction.opcode !== null ? [instruction.opcode] : []).concat(
    operands.reduce<number[]>(
      (operandValues, operand) =>
        operand.value !== undefined ? operandValues.concat(operand.value) : operandValues,
      []
    )
  )
  const position = instruction.token.position
  const length = ((): number => {
    if (operands.length > 0) {
      const lastOperand = operands[operands.length - 1]
      return lastOperand.token.position + lastOperand.token.length - position
    }
    return instruction.mnemonic.length
  })()
  return {
    label,
    instruction,
    operands,
    machineCodes,
    position,
    length
  }
}

const LABEL_START = /^[A-Z_]/

const validateLabel = (token: Token): void => {
  if (!LABEL_START.test(token.value)) {
    throw new InvalidLabelError(token)
  }
}

const parseLabel = (tokens: Token[], index: number): Label | null => {
  const token = tokens[index]
  if (!token.value.endsWith(':')) {
    return null
  }
  validateLabel(token)
  return createLabel(token)
}

const validateNumber = (token: Token): void => {
  if (hexToDec(token.value) > 0xff) {
    throw new InvalidNumberError(token)
  }
}

const NUMBER = /^[\dA-F]+$/
const REGISTER = /^[A-D]L$/

const parseSingleOperand =
  (tokens: Token[], index: number) =>
  <T extends OperandType>(...expectedTypes: T[]): Operand<T> => {
    const token = tokens[index]
    if (token === undefined) {
      throw new MissingEndError()
    }

    const isExpected = (type: OperandType): boolean => expectedTypes.some(t => t === type)
    const createOperandOf = (type: OperandType): Operand<T> => createOperand(type as T, token)

    switch (token.type) {
      case TokenType.Comma:
        break
      case TokenType.Digits:
        if (isExpected(OperandType.Number)) {
          validateNumber(token)
          return createOperandOf(OperandType.Number)
        }
        break
      case TokenType.Register:
        if (isExpected(OperandType.Register)) {
          return createOperandOf(OperandType.Register)
        }
        break
      case TokenType.Address:
        if (isExpected(OperandType.Address) || isExpected(OperandType.RegisterAddress)) {
          if (NUMBER.test(token.value)) {
            validateNumber(token)
            return createOperandOf(OperandType.Address)
          }
          if (REGISTER.test(token.value)) {
            return createOperandOf(OperandType.RegisterAddress)
          }
          throw new AddressError(token)
        }
        break
      case TokenType.String:
        if (isExpected(OperandType.String)) {
          return createOperandOf(OperandType.String)
        }
        break
      case TokenType.Unknown:
        if (isExpected(OperandType.Number) && NUMBER.test(token.value)) {
          validateNumber(token)
          return createOperandOf(OperandType.Number)
        }
        if (isExpected(OperandType.Label)) {
          validateLabel(token)
          return createOperandOf(OperandType.Label)
        }
    }
    throw new OperandTypeError(token, ...expectedTypes)
  }

const checkComma = (token: Token): void => {
  if (token === undefined) {
    throw new MissingEndError()
  }
  if (token.type !== TokenType.Comma) {
    throw new MissingCommaError(token)
  }
}

type SecondOperandErrorCallback<T1 extends OperandType> = (
  firstOperandType: T1,
  secondOperandToken: Token
) => void

const parseDoubleOperands =
  (tokens: Token[], index: number) =>
  <T1 extends OperandType>(...firstExpectedTypes: T1[]) =>
  <T2 extends OperandType>(
    ...secondExpectedTypes: [...T2[], T2 | SecondOperandErrorCallback<T1>]
  ): [firstOperand: Operand<T1>, secondOperand: Operand<T2>] => {
    const firstOperand = parseSingleOperand(tokens, index)(...firstExpectedTypes)
    checkComma(tokens[index + 1])
    const secondOperand = ((): Operand<T2> => {
      const callback =
        typeof secondExpectedTypes[secondExpectedTypes.length - 1] === 'function'
          ? (secondExpectedTypes.pop() as SecondOperandErrorCallback<T1>)
          : undefined
      try {
        return parseSingleOperand(tokens, index + 2)(...(secondExpectedTypes as T2[]))
      } catch (e) {
        if (e instanceof OperandTypeError && callback !== undefined) {
          callback(firstOperand.type, tokens[index + 2])
        }
        throw e
      }
    })()
    return [firstOperand, secondOperand]
  }

const parseStatement = (tokens: Token[], index: number): Statement => {
  const label = parseLabel(tokens, index)
  const hasLabel = label !== null
  if (hasLabel) {
    index++
  }

  const token = tokens[index]
  if (token === undefined) {
    throw new MissingEndError()
  }
  if (token.type !== TokenType.Unknown || !(token.value in Mnemonic)) {
    throw new StatementError(token, hasLabel)
  }

  index++

  const mnemonic = token.value as Mnemonic
  const instruction = createInstruction(mnemonic, token)
  const operands: Operand[] = []

  const operandsCount = MNEMONIC_TO_OPERANDS_COUNT_MAP[mnemonic]
  switch (operandsCount) {
    case 0: {
      instruction.opcode = Opcode[mnemonic as keyof typeof Opcode]
      break
    }
    case 1: {
      let operand

      const parseOperand = parseSingleOperand(tokens, index)

      switch (mnemonic as MnemonicWithOneOperand) {
        case Mnemonic.INC:
          instruction.opcode = Opcode.INC_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.DEC:
          instruction.opcode = Opcode.DEC_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.NOT:
          instruction.opcode = Opcode.NOT_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.ROL:
          instruction.opcode = Opcode.ROL_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.ROR:
          instruction.opcode = Opcode.ROR_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.SHL:
          instruction.opcode = Opcode.SHL_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.SHR:
          instruction.opcode = Opcode.SHR_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.JMP:
          instruction.opcode = Opcode.JMP
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.JZ:
          instruction.opcode = Opcode.JZ
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.JNZ:
          instruction.opcode = Opcode.JNZ
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.JS:
          instruction.opcode = Opcode.JS
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.JNS:
          instruction.opcode = Opcode.JNS
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.JO:
          instruction.opcode = Opcode.JO
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.JNO:
          instruction.opcode = Opcode.JNO
          operand = parseOperand(OperandType.Label)
          break
        case Mnemonic.PUSH:
          instruction.opcode = Opcode.PUSH_FROM_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.POP:
          instruction.opcode = Opcode.POP_TO_REG
          operand = parseOperand(OperandType.Register)
          break
        case Mnemonic.CALL:
          instruction.opcode = Opcode.CALL_ADDR_NUM
          operand = parseOperand(OperandType.Number)
          break
        case Mnemonic.INT:
          instruction.opcode = Opcode.INT_ADDR_NUM
          operand = parseOperand(OperandType.Number)
          break
        case Mnemonic.IN:
          instruction.opcode = Opcode.IN_FROM_PORT_TO_AL
          operand = parseOperand(OperandType.Number)
          break
        case Mnemonic.OUT:
          instruction.opcode = Opcode.OUT_FROM_AL_TO_PORT
          operand = parseOperand(OperandType.Number)
          break
        case Mnemonic.ORG:
          operand = parseOperand(OperandType.Number)
          break
        case Mnemonic.DB:
          operand = parseOperand(OperandType.Number, OperandType.String)
      }

      operands.push(operand)
      break
    }
    case 2: {
      let firstOperand
      let secondOperand

      const parseOperands = parseDoubleOperands(tokens, index)

      switch (mnemonic as MnemonicWithTwoOperands) {
        case Mnemonic.ADD:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.ADD_REG_TO_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.ADD_NUM_TO_REG
              break
          }
          break
        case Mnemonic.SUB:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.SUB_REG_FROM_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.SUB_NUM_FROM_REG
              break
          }
          break
        case Mnemonic.MUL:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.MUL_REG_BY_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.MUL_REG_BY_NUM
              break
          }
          break
        case Mnemonic.DIV:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.DIV_REG_BY_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.DIV_REG_BY_NUM
              break
          }
          break
        case Mnemonic.MOD:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.MOD_REG_BY_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.MOD_REG_BY_NUM
              break
          }
          break
        case Mnemonic.AND:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.AND_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.AND_REG_WITH_NUM
              break
          }
          break
        case Mnemonic.OR:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.OR_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.OR_REG_WITH_NUM
              break
          }
          break
        case Mnemonic.XOR:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.XOR_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.XOR_REG_WITH_NUM
              break
          }
          break
        case Mnemonic.MOV:
          ;[firstOperand, secondOperand] = parseOperands(
            OperandType.Register,
            OperandType.Address,
            OperandType.RegisterAddress
          )(
            OperandType.Number,
            OperandType.Register,
            OperandType.Address,
            OperandType.RegisterAddress,
            (firstOperandType, secondOperandToken) => {
              switch (firstOperandType) {
                case OperandType.Register:
                  throw new OperandTypeError(
                    secondOperandToken,
                    OperandType.Number,
                    OperandType.Address,
                    OperandType.RegisterAddress
                  )
                case OperandType.Address:
                case OperandType.RegisterAddress:
                  throw new OperandTypeError(secondOperandToken, OperandType.Register)
              }
            }
          )
          switch (firstOperand.type) {
            case OperandType.Register:
              switch (secondOperand.type) {
                case OperandType.Number:
                  instruction.opcode = Opcode.MOV_NUM_TO_REG
                  break
                case OperandType.Register:
                  throw new OperandTypeError(
                    secondOperand.token,
                    OperandType.Number,
                    OperandType.Address,
                    OperandType.RegisterAddress
                  )
                case OperandType.Address:
                  instruction.opcode = Opcode.MOV_ADDR_TO_REG
                  break
                case OperandType.RegisterAddress:
                  instruction.opcode = Opcode.MOV_REG_ADDR_TO_REG
                  break
              }
              break
            case OperandType.Address:
              if (secondOperand.type !== OperandType.Register) {
                throw new OperandTypeError(secondOperand.token, OperandType.Register)
              }
              instruction.opcode = Opcode.MOV_REG_TO_ADDR
              break
            case OperandType.RegisterAddress:
              if (secondOperand.type !== OperandType.Register) {
                throw new OperandTypeError(secondOperand.token, OperandType.Register)
              }
              instruction.opcode = Opcode.MOV_REG_TO_REG_ADDR
              break
          }
          break
        case Mnemonic.CMP:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number,
            OperandType.Address
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.CMP_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.CMP_REG_WITH_NUM
              break
            case OperandType.Address:
              instruction.opcode = Opcode.CMP_REG_WITH_ADDR
              break
          }
      }

      operands.push(firstOperand, secondOperand)
    }
  }

  return createStatement(label, instruction, operands)
}

const getConsumedTokensCount = (statement: Statement): number => {
  const { label, operands } = statement
  return (
    /* label */ (label !== null ? 1 : 0) +
    /* instruction */ 1 +
    /* operands */ operands.length +
    /* comma */ (operands.length === 2 ? 1 : 0)
  )
}

export const parse = (tokens: Token[]): Statement[] => {
  const statements: Statement[] = []
  let index = 0
  while (index < tokens.length) {
    const statement = parseStatement(tokens, index)
    statements.push(statement)
    index += getConsumedTokensCount(statement)
  }
  if (statements[statements.length - 1].instruction.mnemonic !== Mnemonic.END) {
    throw new MissingEndError()
  }
  return statements
}
