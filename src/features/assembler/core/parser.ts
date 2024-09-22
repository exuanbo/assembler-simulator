import { Mnemonic, MnemonicToOperandCountMap, Opcode } from '@/common/constants'
import { call, hexToDec, invariant, isIn, stringToAscii } from '@/common/utils'
import { GeneralPurposeRegister } from '@/features/cpu/core'

import {
  AddressError,
  EndOfTokenStreamError,
  InvalidLabelError,
  InvalidNumberError,
  InvalidStringError,
  MissingCommaError,
  MissingEndError,
  OperandTypeError,
  StatementError,
} from './exceptions'
import { createTokenizer, type Token, type Tokenizer, TokenType } from './tokenizer'
import type {
  MnemonicWithNoOperand,
  MnemonicWithOneOperand,
  MnemonicWithTwoOperands,
  SourceRange,
} from './types'

interface BaseNode {
  range: SourceRange
}

export interface Label extends BaseNode {
  identifier: string
}

const createLabel = ({ value, range }: Token): Label => {
  return {
    identifier: value,
    range,
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
    range,
  }
}

export enum OperandType {
  Number = 'Number',
  Register = 'Register',
  Address = 'Address',
  RegisterAddress = 'RegisterAddress',
  String = 'String',
  Label = 'Label',
}

export interface Operand<T extends OperandType = OperandType> extends BaseNode {
  type: T
  value: string
  source: string
  code: number | number[] | undefined
}

const createOperand = <T extends OperandType>(type: T, token: Token): Operand<T> => {
  const code = call((): Operand['code'] => {
    switch (type) {
    case OperandType.Number:
    case OperandType.Address:
      return hexToDec(token.value)
    case OperandType.Register:
    case OperandType.RegisterAddress:
      invariant(isIn(token.value, GeneralPurposeRegister))
      return GeneralPurposeRegister[token.value]
    case OperandType.String:
      return stringToAscii(token.value)
    case OperandType.Label:
      return undefined
    }
  })
  return {
    ...token,
    type,
    code,
  }
}

export interface Statement extends BaseNode {
  label: Label | null
  instruction: Instruction
  operands: Operand[]
  codes: number[]
}

const createStatement = (
  label: Label | null,
  instruction: Instruction,
  operands: Operand[],
): Statement => {
  invariant(instruction.opcode !== undefined)
  const codes: number[] = []
  if (instruction.opcode !== null) {
    codes.push(instruction.opcode)
  }
  operands.forEach((operand) => {
    if (operand.code !== undefined) {
      if (typeof operand.code === 'number') {
        codes.push(operand.code)
      }
      else {
        codes.push(...operand.code)
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
    codes,
    range: { from, to },
  }
}

const LABEL_REGEXP = /^[A-Z_]+$/

const validateLabel = (token: Token): Token => {
  if (!LABEL_REGEXP.test(token.value)) {
    throw new InvalidLabelError(token)
  }
  return token
}

const parseLabel = (tokenizer: Tokenizer): Label | null => {
  const nextToken = tokenizer.peekNext()
  if (nextToken?.type !== TokenType.Colon || nextToken.range.from !== tokenizer.peek()!.range.to) {
    return null
  }
  const token = tokenizer.consume()
  const label = createLabel(validateLabel(token))
  tokenizer.advance()
  return label
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

const parseSingleOperand = (tokenizer: Tokenizer) =>
  <T extends OperandType>(...expectedTypes: T[]): Operand<T> => {
    const token = tokenizer.consume()
    let t: OperandType

    const isExpectedType = (type: OperandType): type is T =>
      (<OperandType[]>expectedTypes).includes(type)

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
      switch (true) {
      case isExpectedType((t = OperandType.Number)):
        if (NUMBER_REGEXP.test(token.value)) {
          return createOperand(t, validateNumber(token))
        }
        break
      case isExpectedType((t = OperandType.Label)):
        return createOperand(t, validateLabel(token))
      }
      break
    }
    throw new OperandTypeError(token, expectedTypes)
  }

const parseDoubleOperands = (tokenizer: Tokenizer) =>
  <T1 extends OperandType, T2 extends OperandType>(
    expectedTypePairs: Array<[firstOperandType: T1, secondOperandType: T2]>,
  ): [firstOperand: Operand<T1>, secondOperand: Operand<T2>] => {
    const possibleFirstOperandTypes: T1[] = []
    expectedTypePairs.forEach(([firstOperandType]) => {
      if (!possibleFirstOperandTypes.includes(firstOperandType)) {
        possibleFirstOperandTypes.push(firstOperandType)
      }
    })
    const firstOperand = parseSingleOperand(tokenizer)(...possibleFirstOperandTypes)
    if (!tokenizer.match(TokenType.Comma)) {
      throw new MissingCommaError(tokenizer.peek()!)
    }
    const possibleSecondOperandTypes: T2[] = []
    expectedTypePairs.forEach(([firstOperandType, secondOperandType]) => {
      if (firstOperandType === firstOperand.type) {
        possibleSecondOperandTypes.push(secondOperandType)
      }
    })
    const secondOperand = parseSingleOperand(tokenizer)(...possibleSecondOperandTypes)
    return [firstOperand, secondOperand]
  }

const parseStatement = (tokenizer: Tokenizer): Statement => {
  const label = parseLabel(tokenizer)
  const hasLabel = label !== null

  const token = tokenizer.consume()
  if (token.type !== TokenType.Unknown || !isIn(token.value, Mnemonic)) {
    throw new StatementError(token, hasLabel)
  }

  const instruction = createInstruction(token)
  const setOpcode = (opcode: Opcode | null): void => {
    instruction.opcode = opcode
  }

  const operands: Operand[] = []
  const setOperands = (...parsedOperands: Operand[]): void => {
    operands.push(...parsedOperands)
  }

  const mnemonic = token.value
  const operandCount = MnemonicToOperandCountMap[mnemonic]

  switch (operandCount) {
  case 0: {
    setOpcode(Opcode[<MnemonicWithNoOperand>mnemonic])
    break
  }
  case 1: {
    let opcode, operand
    const parseOperand = parseSingleOperand(tokenizer)

    switch (<MnemonicWithOneOperand>mnemonic) {
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
    break
  }
  case 2: {
    let opcode, firstOperand, secondOperand
    const parseOperands = parseDoubleOperands(tokenizer)

    switch (<MnemonicWithTwoOperands>mnemonic) {
    case Mnemonic.ADD:
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
      ])
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Number],
        [OperandType.Register, OperandType.Address],
        [OperandType.Address, OperandType.Register],
        [OperandType.Register, OperandType.RegisterAddress],
        [OperandType.RegisterAddress, OperandType.Register],
      ])
      switch (firstOperand.type) {
      case OperandType.Register:
        invariant(secondOperand.type !== OperandType.Register)
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
      ;[firstOperand, secondOperand] = parseOperands([
        [OperandType.Register, OperandType.Register],
        [OperandType.Register, OperandType.Number],
        [OperandType.Register, OperandType.Address],
      ])
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
    break
  }
  }

  return createStatement(label, instruction, operands)
}

export const parse = (source: string): Statement[] => {
  const tokenizer = createTokenizer(source)
  const statements: Statement[] = []
  while (tokenizer.hasMore()) {
    try {
      const statement = parseStatement(tokenizer)
      statements.push(statement)
      if (statement.instruction.mnemonic === Mnemonic.END) {
        break
      }
    }
    catch (error) {
      if (error instanceof EndOfTokenStreamError) {
        throw new MissingEndError()
      }
      throw error
    }
  }
  if (
    statements.length > 0
    && statements[statements.length - 1].instruction.mnemonic !== Mnemonic.END
  ) {
    throw new MissingEndError()
  }
  return statements
}
