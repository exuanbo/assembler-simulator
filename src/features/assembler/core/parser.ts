import type { Locatable } from './types'
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
} from './exceptions'
import {
  Mnemonic,
  MnemonicToOperandsCountMap,
  MnemonicWithOneOperand,
  MnemonicWithTwoOperands,
  Opcode,
  GeneralPurposeRegister,
  GeneralPurposeRegisterName
} from '../../../common/constants'
import { call, hexToDec, stringToAscii } from '../../../common/utils'

export interface Label extends Locatable {
  identifier: string
}

const createLabel = ({ value, start, end }: Token): Label => {
  return {
    identifier: value,
    start,
    end
  }
}

interface Instruction extends Locatable {
  opcode: Opcode | null
  mnemonic: string
}

const createInstruction = ({ value, start, end }: Token): Instruction => {
  const opcode = null
  return {
    opcode,
    mnemonic: value,
    start,
    end
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

export interface Operand<T extends OperandType = OperandType> extends Locatable {
  type: T
  value: number | number[] | undefined
  rawValue: string
  raw: string
}

const __createOperand = <T extends OperandType>(type: T, token: Token): Operand<T> => {
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
  const { value: rawValue, raw, start, end } = token
  return {
    type,
    value,
    rawValue,
    raw,
    start,
    end
  }
}

export interface Statement extends Locatable {
  label: Label | null
  instruction: Instruction
  operands: Operand[]
  machineCodes: number[]
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
  const start = instruction.start
  const lastNode = operands.length > 0 ? operands[operands.length - 1] : instruction
  const end = lastNode.end
  return {
    label,
    instruction,
    operands,
    machineCodes,
    start,
    end
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
  if (!(tokens[index + 1]?.type === TokenType.Colon)) {
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

const NUMBER_REGEXP = /^[\dA-F]+$/
const REGISTER_REGEXP = /^[A-D]L$/

const parseSingleOperand =
  (tokens: Token[], index: number) =>
  <T extends OperandType>(...expectedTypes: T[]): Operand<T> => {
    const token = tokens[index]
    if (token === undefined) {
      throw new MissingEndError()
    }

    const isExpected = (type: OperandType): boolean => expectedTypes.includes(type as T)
    const createOperand = (type: OperandType, token: Token): Operand<T> => __createOperand(type as T, token) // prettier-ignore

    switch (token.type) {
      case TokenType.Digits:
        if (isExpected(OperandType.Number)) {
          return createOperand(OperandType.Number, validateNumber(token))
        }
        break
      case TokenType.Register:
        if (isExpected(OperandType.Register)) {
          return createOperand(OperandType.Register, token)
        }
        break
      case TokenType.Address:
        if (isExpected(OperandType.Address) /* || isExpected(OperandType.RegisterAddress) */) {
          if (NUMBER_REGEXP.test(token.value)) {
            return createOperand(OperandType.Address, validateNumber(token))
          }
          if (REGISTER_REGEXP.test(token.value)) {
            return createOperand(OperandType.RegisterAddress, token)
          }
          throw new AddressError(token)
        }
        break
      case TokenType.String:
        if (isExpected(OperandType.String)) {
          return createOperand(OperandType.String, token)
        }
        break
      case TokenType.Unknown:
        if (isExpected(OperandType.Number) && NUMBER_REGEXP.test(token.value)) {
          return createOperand(OperandType.Number, validateNumber(token))
        }
        if (isExpected(OperandType.Label)) {
          return createOperand(OperandType.Label, validateLabel(token))
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
      (resultTypes, [firstOperandType]) =>
        resultTypes.includes(firstOperandType) ? resultTypes : [...resultTypes, firstOperandType],
      []
    )
    const firstOperand = parseSingleOperand(tokens, index)(...firstOperandTypes)
    const error = checkComma(tokens[index + 1])
    if (error !== null) {
      throw error
    }
    const secondOperandTypes = expectedTypes.reduce<T2[]>(
      (resultTypes, [firstOperandType, secondOperandType]) =>
        firstOperandType === firstOperand.type ? [...resultTypes, secondOperandType] : resultTypes,
      []
    )
    const secondOperand = parseSingleOperand(tokens, index + 2)(...secondOperandTypes)
    return [firstOperand, secondOperand]
  }

const parseStatement = (
  tokens: Token[],
  __index: number
): [statement: Statement, consumed: number] => {
  let consumed = 0
  const getIndex = (): number => __index + consumed
  const consumeToken = (count: number): void => {
    consumed += count
  }

  const label = parseLabel(tokens, getIndex())
  const hasLabel = label !== null
  if (hasLabel) {
    consumeToken(2)
  }

  const token = tokens[getIndex()]
  if (token === undefined) {
    throw new MissingEndError()
  }
  if (token.type !== TokenType.Unknown || !(token.value in Mnemonic)) {
    throw new StatementError(token, hasLabel)
  }

  consumeToken(1)

  const instruction = createInstruction(token)
  const setOpcode = (opcode: Opcode): void => {
    instruction.opcode = opcode
  }

  const operands: Operand[] = []
  const addOperands = (...__operands: Operand[]): void => {
    operands.push(...__operands)
  }

  const mnemonic = token.value as Mnemonic
  const operandsCount = MnemonicToOperandsCountMap[mnemonic]

  switch (operandsCount) {
    case 0: {
      setOpcode(Opcode[mnemonic as keyof typeof Opcode])
      break
    }
    case 1: {
      const parseOperand = parseSingleOperand(tokens, getIndex())

      switch (mnemonic as MnemonicWithOneOperand) {
        case Mnemonic.INC:
          setOpcode(Opcode.INC_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.DEC:
          setOpcode(Opcode.DEC_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.NOT:
          setOpcode(Opcode.NOT_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.ROL:
          setOpcode(Opcode.ROL_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.ROR:
          setOpcode(Opcode.ROR_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.SHL:
          setOpcode(Opcode.SHL_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.SHR:
          setOpcode(Opcode.SHR_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.JMP:
          setOpcode(Opcode.JMP)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.JZ:
          setOpcode(Opcode.JZ)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.JNZ:
          setOpcode(Opcode.JNZ)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.JS:
          setOpcode(Opcode.JS)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.JNS:
          setOpcode(Opcode.JNS)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.JO:
          setOpcode(Opcode.JO)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.JNO:
          setOpcode(Opcode.JNO)
          addOperands(parseOperand(OperandType.Label))
          break
        case Mnemonic.PUSH:
          setOpcode(Opcode.PUSH_FROM_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.POP:
          setOpcode(Opcode.POP_TO_REG)
          addOperands(parseOperand(OperandType.Register))
          break
        case Mnemonic.CALL:
          setOpcode(Opcode.CALL_ADDR)
          addOperands(parseOperand(OperandType.Number))
          break
        case Mnemonic.INT:
          setOpcode(Opcode.INT_ADDR)
          addOperands(parseOperand(OperandType.Number))
          break
        case Mnemonic.IN:
          setOpcode(Opcode.IN_FROM_PORT_TO_AL)
          addOperands(parseOperand(OperandType.Number))
          break
        case Mnemonic.OUT:
          setOpcode(Opcode.OUT_FROM_AL_TO_PORT)
          addOperands(parseOperand(OperandType.Number))
          break
        case Mnemonic.ORG:
          addOperands(parseOperand(OperandType.Number))
          break
        case Mnemonic.DB:
          addOperands(parseOperand(OperandType.Number, OperandType.String))
      }

      consumeToken(1)
      break
    }
    case 2: {
      let firstOperand, secondOperand

      const parseOperands = parseDoubleOperands(tokens, getIndex())

      switch (mnemonic as MnemonicWithTwoOperands) {
        case Mnemonic.ADD:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.ADD_REG_TO_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.ADD_NUM_TO_REG)
          }
          break
        case Mnemonic.SUB:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.SUB_REG_FROM_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.SUB_NUM_FROM_REG)
          }
          break
        case Mnemonic.MUL:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.MUL_REG_BY_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.MUL_REG_BY_NUM)
          }
          break
        case Mnemonic.DIV:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.DIV_REG_BY_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.DIV_REG_BY_NUM)
          }
          break
        case Mnemonic.MOD:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.MOD_REG_BY_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.MOD_REG_BY_NUM)
          }
          break
        case Mnemonic.AND:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.AND_REG_WITH_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.AND_REG_WITH_NUM)
          }
          break
        case Mnemonic.OR:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.OR_REG_WITH_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.OR_REG_WITH_NUM)
          }
          break
        case Mnemonic.XOR:
          ;[firstOperand, secondOperand] = parseOperands(
            [OperandType.Register, OperandType.Register],
            [OperandType.Register, OperandType.Number]
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              setOpcode(Opcode.XOR_REG_WITH_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.XOR_REG_WITH_NUM)
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
                  setOpcode(Opcode.MOV_NUM_TO_REG)
                  break
                case OperandType.Address:
                  setOpcode(Opcode.MOV_ADDR_TO_REG)
                  break
                case OperandType.RegisterAddress:
                  setOpcode(Opcode.MOV_REG_ADDR_TO_REG)
              }
              break
            case OperandType.Address:
              setOpcode(Opcode.MOV_REG_TO_ADDR)
              break
            case OperandType.RegisterAddress:
              setOpcode(Opcode.MOV_REG_TO_REG_ADDR)
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
              setOpcode(Opcode.CMP_REG_WITH_REG)
              break
            case OperandType.Number:
              setOpcode(Opcode.CMP_REG_WITH_NUM)
              break
            case OperandType.Address:
              setOpcode(Opcode.CMP_REG_WITH_ADDR)
          }
      }

      addOperands(firstOperand, secondOperand)
      consumeToken(3)
    }
  }

  return [createStatement(label, instruction, operands), consumed]
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
    statements[statements.length - 1].instruction.opcode !== Opcode.END
  ) {
    throw new MissingEndError()
  }
  return statements
}
