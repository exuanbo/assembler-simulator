import { TokenType, Token } from './tokenizer'
import {
  AssemblerError,
  InvalidLabelError,
  StatementError,
  MissingEndError,
  AddressError,
  InvalidNumberError,
  OperandTypeError,
  MissingCommaError
} from '../../../common/exceptions'
import {
  Mnemonic,
  MNEMONIC_TO_OPERANDS_COUNT_MAP,
  MnemonicWithOneOperand,
  MnemonicWithTwoOperands,
  Opcode,
  Register
} from '../../../common/constants'
import { exp, hexToDec, stringToASCII } from '../../../common/utils'

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
  opcode: Opcode | null
  token: Token
}

const createInstruction = (token: Token): Instruction => {
  const opcode = null
  return {
    opcode,
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
  const value = exp<Operand['value']>(() => {
    switch (type) {
      case OperandType.Number:
      case OperandType.Address:
        return hexToDec(token.value)
      case OperandType.Register:
      case OperandType.RegisterAddress:
        return Register[token.value as keyof typeof Register]
      case OperandType.String:
        return stringToASCII(token.value)
      case OperandType.Label:
        return undefined
    }
  })
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
  const machineCodes = [
    ...(instruction.opcode !== null ? [instruction.opcode] : []),
    ...operands.reduce<number[]>(
      (operandValues, operand) =>
        operand.value !== undefined ? operandValues.concat(operand.value) : operandValues,
      []
    )
  ]
  const position = instruction.token.position
  const length = exp<number>(() => {
    if (operands.length > 0) {
      const lastOperand = operands[operands.length - 1]
      return lastOperand.token.position + lastOperand.token.length - position
    }
    return instruction.token.value.length
  })
  return {
    label,
    instruction,
    operands,
    machineCodes,
    position,
    length
  }
}

const LABEL = /^[A-Z_]+:?$/

const validateLabel = (token: Token): Token => {
  if (!LABEL.test(token.value)) {
    throw new InvalidLabelError(token)
  }
  return token
}

const parseLabel = (tokens: Token[], index: number): Label | null => {
  const token = tokens[index]
  if (!token.value.endsWith(':')) {
    return null
  }
  return createLabel(validateLabel(token))
}

const validateNumber = (token: Token): Token => {
  if (hexToDec(token.value) > 0xff) {
    throw new InvalidNumberError(token)
  }
  return token
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
    const __createOperand = (type: OperandType, token: Token): Operand<T> => createOperand(type as T, token) // eslint-disable-line

    switch (token.type) {
      case TokenType.Digits:
        if (isExpected(OperandType.Number)) {
          return __createOperand(OperandType.Number, validateNumber(token))
        }
        break
      case TokenType.Register:
        if (isExpected(OperandType.Register)) {
          return __createOperand(OperandType.Register, token)
        }
        break
      case TokenType.Address:
        if (isExpected(OperandType.Address) /* || isExpected(OperandType.RegisterAddress) */) {
          if (NUMBER.test(token.value)) {
            return __createOperand(OperandType.Address, validateNumber(token))
          }
          if (REGISTER.test(token.value)) {
            return __createOperand(OperandType.RegisterAddress, token)
          }
          throw new AddressError(token)
        }
        break
      case TokenType.String:
        if (isExpected(OperandType.String)) {
          return __createOperand(OperandType.String, token)
        }
        break
      case TokenType.Unknown:
        if (isExpected(OperandType.Number) && NUMBER.test(token.value)) {
          return __createOperand(OperandType.Number, validateNumber(token))
        }
        if (isExpected(OperandType.Label)) {
          return __createOperand(OperandType.Label, validateLabel(token))
        }
    }
    throw new OperandTypeError(token, ...expectedTypes)
  }

const checkComma = (token: Token): AssemblerError | null => {
  if (token === undefined) {
    return new MissingEndError()
  }
  if (token.type !== TokenType.Comma) {
    return new MissingCommaError(token)
  }
  return null
}

const parseDoubleOperands =
  (tokens: Token[], index: number) =>
  <T1 extends OperandType, T2 extends OperandType>(
    ...expectedTypes: Array<[firstOperandType: T1, secondOperandType: T2]>
  ): [firstOperand: Operand<T1>, secondOperand: Operand<T2>] => {
    const firstOperandTypes = expectedTypes.reduce<T1[]>(
      (result, [firstOperandType]) =>
        result.includes(firstOperandType) ? result : [...result, firstOperandType],
      []
    )
    const firstOperand = parseSingleOperand(tokens, index)(...firstOperandTypes)
    const error = checkComma(tokens[index + 1])
    if (error !== null) {
      throw error
    }
    const secondOperandTypes = expectedTypes.reduce<T2[]>(
      (result, [firstOperandType, secondOperandType]) =>
        firstOperandType === firstOperand.type ? [...result, secondOperandType] : result,
      []
    )
    const secondOperand = parseSingleOperand(tokens, index + 2)(...secondOperandTypes)
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

  const instruction = createInstruction(token)
  const operands: Operand[] = []

  const mnemonic = token.value as Mnemonic
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
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.ADD_REG_TO_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.ADD_NUM_TO_REG
          }
          break
        case Mnemonic.SUB:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.SUB_REG_FROM_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.SUB_NUM_FROM_REG
          }
          break
        case Mnemonic.MUL:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.MUL_REG_BY_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.MUL_REG_BY_NUM
          }
          break
        case Mnemonic.DIV:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.DIV_REG_BY_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.DIV_REG_BY_NUM
          }
          break
        case Mnemonic.MOD:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.MOD_REG_BY_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.MOD_REG_BY_NUM
          }
          break
        case Mnemonic.AND:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.AND_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.AND_REG_WITH_NUM
          }
          break
        case Mnemonic.OR:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.OR_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.OR_REG_WITH_NUM
          }
          break
        case Mnemonic.XOR:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instruction.opcode = Opcode.XOR_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.XOR_REG_WITH_NUM
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
                  instruction.opcode = Opcode.MOV_NUM_TO_REG
                  break
                case OperandType.Address:
                  instruction.opcode = Opcode.MOV_ADDR_TO_REG
                  break
                case OperandType.RegisterAddress:
                  instruction.opcode = Opcode.MOV_REG_ADDR_TO_REG
              }
              break
            case OperandType.Address:
              instruction.opcode = Opcode.MOV_REG_TO_ADDR
              break
            case OperandType.RegisterAddress:
              instruction.opcode = Opcode.MOV_REG_TO_REG_ADDR
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
              instruction.opcode = Opcode.CMP_REG_WITH_REG
              break
            case OperandType.Number:
              instruction.opcode = Opcode.CMP_REG_WITH_NUM
              break
            case OperandType.Address:
              instruction.opcode = Opcode.CMP_REG_WITH_ADDR
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
  if (
    statements.length === 0 ||
    statements[statements.length - 1].instruction.opcode !== Opcode.END
  ) {
    throw new MissingEndError()
  }
  return statements
}
