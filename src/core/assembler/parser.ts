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
import type { InstructionWithOneOperand, InstructionWithTwoOperands } from '../constants'
import {
  Instruction,
  INSTRUCTION_OPERANDS_COUNT_MAP,
  InstrOpcode,
  Register,
  REGISTER_CODE_MAP
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
        return REGISTER_CODE_MAP[token.value as Register]
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
  opcodes: number[]
  position: number
  length: number
}

const createStatement = (
  label: Label | null,
  instruction: Instruction,
  operands: Operand[],
  opcodes: number[],
  position: number
): Statement => {
  const length = ((): number => {
    if (operands.length > 0) {
      const lastOperand = operands[operands.length - 1]
      return lastOperand.token.position + lastOperand.token.length - position
    }
    return instruction.length
  })()
  return {
    label,
    instruction,
    operands,
    opcodes,
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
    const parseOperand = parseSingleOperand.bind(null, tokens)

    const firstOperand = parseOperand(index)(...firstExpectedTypes)
    checkComma(tokens[index + 1])
    const secondOperand = ((): Operand<T2> => {
      const callback =
        typeof secondExpectedTypes[secondExpectedTypes.length - 1] === 'function'
          ? (secondExpectedTypes.pop() as SecondOperandErrorCallback<T1>)
          : undefined
      try {
        return parseOperand(index + 2)(...(secondExpectedTypes as T2[]))
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
  if (label !== null) {
    index++
  }

  const token = tokens[index]
  if (token === undefined) {
    throw new MissingEndError()
  }
  if (token.type !== TokenType.Unknown || !(token.value in Instruction)) {
    throw new StatementError(token)
  }

  index++

  const instruction = token.value as Instruction
  const operands: Operand[] = []
  const opcodes: number[] = []
  const position = token.position

  const operandsCount = INSTRUCTION_OPERANDS_COUNT_MAP[instruction]
  switch (operandsCount) {
    case 0: {
      const instrOpcode = InstrOpcode[instruction as keyof typeof InstrOpcode]
      opcodes.push(instrOpcode)
      break
    }
    case 1: {
      let operand
      let instrOpcode: InstrOpcode | null

      const parseOperand = parseSingleOperand(tokens, index)

      switch (instruction as InstructionWithOneOperand) {
        case Instruction.INC:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.INC_REG
          break
        case Instruction.DEC:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.DEC_REG
          break
        case Instruction.NOT:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.NOT_REG
          break
        case Instruction.ROL:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.ROL_REG
          break
        case Instruction.ROR:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.ROR_REG
          break
        case Instruction.SHL:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.SHL_REG
          break
        case Instruction.SHR:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.SHR_REG
          break
        case Instruction.JMP:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JMP
          break
        case Instruction.JZ:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JZ
          break
        case Instruction.JNZ:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JNZ
          break
        case Instruction.JS:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JS
          break
        case Instruction.JNS:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JNS
          break
        case Instruction.JO:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JO
          break
        case Instruction.JNO:
          operand = parseOperand(OperandType.Label)
          instrOpcode = InstrOpcode.JNO
          break
        case Instruction.PUSH:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.PUSH_FROM_REG
          break
        case Instruction.POP:
          operand = parseOperand(OperandType.Register)
          instrOpcode = InstrOpcode.POP_TO_REG
          break
        case Instruction.CALL:
          operand = parseOperand(OperandType.Number)
          instrOpcode = InstrOpcode.CALL_ADDR_NUM
          break
        case Instruction.INT:
          operand = parseOperand(OperandType.Number)
          instrOpcode = InstrOpcode.INT_ADDR_NUM
          break
        case Instruction.IN:
          operand = parseOperand(OperandType.Number)
          instrOpcode = InstrOpcode.IN_FROM_PORT_TO_AL
          break
        case Instruction.OUT:
          operand = parseOperand(OperandType.Number)
          instrOpcode = InstrOpcode.OUT_FROM_AL_TO_PORT
          break
        case Instruction.ORG:
          operand = parseOperand(OperandType.Number)
          instrOpcode = null
          break
        case Instruction.DB:
          operand = parseOperand(OperandType.Number, OperandType.String)
          instrOpcode = null
      }

      operands.push(operand)
      if (instrOpcode !== null) {
        opcodes.push(instrOpcode)
      }
      break
    }
    case 2: {
      let firstOperand
      let secondOperand
      let instrOpcode: InstrOpcode

      const parseOperands = parseDoubleOperands(tokens, index)

      switch (instruction as InstructionWithTwoOperands) {
        case Instruction.ADD:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.ADD_REG_TO_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.ADD_NUM_TO_REG
              break
          }
          break
        case Instruction.SUB:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.SUB_REG_FROM_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.SUB_NUM_FROM_REG
              break
          }
          break
        case Instruction.MUL:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.MUL_REG_BY_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.MUL_REG_BY_NUM
              break
          }
          break
        case Instruction.DIV:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.DIV_REG_BY_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.DIV_REG_BY_NUM
              break
          }
          break
        case Instruction.MOD:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.MOD_REG_BY_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.MOD_REG_BY_NUM
              break
          }
          break
        case Instruction.AND:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.AND_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.AND_REG_WITH_NUM
              break
          }
          break
        case Instruction.OR:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.OR_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.OR_REG_WITH_NUM
              break
          }
          break
        case Instruction.XOR:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.XOR_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.XOR_REG_WITH_NUM
              break
          }
          break
        case Instruction.MOV:
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
                  instrOpcode = InstrOpcode.MOV_NUM_TO_REG
                  break
                case OperandType.Register:
                  throw new OperandTypeError(
                    secondOperand.token,
                    OperandType.Number,
                    OperandType.Address,
                    OperandType.RegisterAddress
                  )
                case OperandType.Address:
                  instrOpcode = InstrOpcode.MOV_ADDR_TO_REG
                  break
                case OperandType.RegisterAddress:
                  instrOpcode = InstrOpcode.MOV_REG_ADDR_TO_REG
                  break
              }
              break
            case OperandType.Address:
              if (secondOperand.type !== OperandType.Register) {
                throw new OperandTypeError(secondOperand.token, OperandType.Register)
              }
              instrOpcode = InstrOpcode.MOV_REG_TO_ADDR
              break
            case OperandType.RegisterAddress:
              if (secondOperand.type !== OperandType.Register) {
                throw new OperandTypeError(secondOperand.token, OperandType.Register)
              }
              instrOpcode = InstrOpcode.MOV_REG_TO_REG_ADDR
              break
          }
          break
        case Instruction.CMP:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number,
            OperandType.Address
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = InstrOpcode.CMP_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = InstrOpcode.CMP_REG_WITH_NUM
              break
            case OperandType.Address:
              instrOpcode = InstrOpcode.CMP_REG_WITH_ADDR
              break
          }
      }

      operands.push(firstOperand, secondOperand)
      opcodes.push(instrOpcode)
    }
  }

  if (instruction !== Instruction.ORG) {
    opcodes.push(
      ...operands.reduce<number[]>(
        (operandsOpcodes, operand) =>
          operand.value !== undefined ? operandsOpcodes.concat(operand.value) : operandsOpcodes,
        []
      )
    )
  }
  return createStatement(label, instruction, operands, opcodes, position)
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
  if (statements[statements.length - 1].instruction !== Instruction.END) {
    throw new MissingEndError()
  }
  return statements
}
