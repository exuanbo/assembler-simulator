import { TokenType, Token } from './tokenizer'
import { hexToDec, stringToAscii } from '../utils'
import {
  InvalidLabelError,
  StatementError,
  MissingEndError,
  AddressError,
  InvalidNumberError,
  OperandTypeError,
  MissingCommaError
} from './exceptions'
import type {
  InstructionWithNoOperand,
  InstructionWithOneOperand,
  InstructionWithTwoOperands
} from '../constants'
import {
  Instruction,
  Opcode,
  INSTRUCTION_OPERANDS_COUNT_MAP,
  Register,
  REGISTER_CODE_MAP
} from '../constants'

export class Label {
  public identifier: string
  public token: Token

  constructor(token: Token) {
    this.identifier = token.value.slice(0, -1)
    this.token = token
  }
}

export enum OperandType {
  Number = 'NUMBER',
  Register = 'REGISTER',
  Address = 'ADDRESS',
  RegisterAddress = 'REGISTER_ADDRESS',
  Label = 'LABEL',
  String = 'STRING'
}

class Operand<T extends OperandType = OperandType> {
  public type: T
  public value: number | string
  public token: Token

  constructor(type: T, token: Token) {
    this.type = type
    switch (type) {
      case OperandType.Number:
      case OperandType.Address:
        this.value = hexToDec(token.value)
        break
      case OperandType.Register:
      case OperandType.RegisterAddress:
        this.value = REGISTER_CODE_MAP[token.value as Register]
        break
      case OperandType.Label:
        // TODO does `NaN` makes sense here?
        this.value = NaN
        break
      default:
        // case OperandType.String:
        this.value = token.value
    }
    this.token = token
  }

  public static getOpcodes(...operands: Operand[]): number[] {
    // TODO report bug
    // eslint-disable-next-line array-callback-return
    return operands.reduce<number[]>((opcodes, operand) => {
      switch (operand.type) {
        case OperandType.Number:
        case OperandType.Register:
        case OperandType.Address:
        case OperandType.RegisterAddress:
          return [...opcodes, operand.value as number]
        case OperandType.Label:
          return opcodes
        case OperandType.String:
          return [...opcodes, ...stringToAscii(operand.value as string)]
      }
    }, [])
  }
}

export class Statement {
  public label: Label | null
  public instruction: Instruction
  public operands: Operand[]
  public opcodes: number[]
  public position: number
  public length: number

  constructor(
    label: Label | null,
    instruction: Instruction,
    operands: Operand[],
    opcodes: number[],
    position: number
  ) {
    this.label = label
    this.instruction = instruction
    this.operands = operands
    this.opcodes = opcodes
    this.position = position
    this.length = this.getLength()
  }

  private getLength(): number {
    if (this.operands.length > 0) {
      const lastOperand = this.operands[this.operands.length - 1]
      return lastOperand.token.position + lastOperand.token.length - this.position
    }
    return this.instruction.length
  }

  public getConsumedTokensCount(): number {
    return (
      /* label */ (this.label !== null ? 1 : 0) +
      /* instruction */ 1 +
      /* operands */ this.operands.length +
      /* comma */ (this.operands.length === 2 ? 1 : 0)
    )
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
  return new Label(token)
}

const NUMBER = /^[\dA-F]+$/
const REGISTER = /^[A-D]L$/

const validateNumber = (token: Token): void => {
  if (hexToDec(token.value) > 255) {
    throw new InvalidNumberError(token)
  }
}

const createSingleOperandParser =
  (tokens: Token[], index: number) =>
  <T extends OperandType>(...expectedTypes: T[]): Operand<T> => {
    const token = tokens[index]
    if (token === undefined) {
      throw new MissingEndError()
    }

    const isExpected = (type: OperandType): boolean => expectedTypes.some(t => t === type)
    const createOperand = (type: OperandType): Operand<T> => new Operand(type as T, token)

    switch (token.type) {
      case TokenType.Comma:
        break
      case TokenType.String:
        if (isExpected(OperandType.String)) {
          return createOperand(OperandType.String)
        }
        break
      case TokenType.Address:
        if (isExpected(OperandType.Address) || isExpected(OperandType.RegisterAddress)) {
          if (NUMBER.test(token.value)) {
            validateNumber(token)
            return createOperand(OperandType.Address)
          }
          if (REGISTER.test(token.value)) {
            return createOperand(OperandType.RegisterAddress)
          }
          throw new AddressError(token)
        }
        break
      case TokenType.Digits:
        if (isExpected(OperandType.Number)) {
          validateNumber(token)
          return createOperand(OperandType.Number)
        }
        break
      case TokenType.Unknown:
        if (isExpected(OperandType.Number) && NUMBER.test(token.value)) {
          validateNumber(token)
          return createOperand(OperandType.Number)
        }
        if (isExpected(OperandType.Register) && REGISTER.test(token.value)) {
          return createOperand(OperandType.Register)
        }
        if (isExpected(OperandType.Label)) {
          validateLabel(token)
          return createOperand(OperandType.Label)
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

type SecondOperandErrorCallback<T extends OperandType> = (
  firstOperandType: T,
  secondOperandToken: Token
) => void

const createDoubleOperandsParser =
  (tokens: Token[], index: number) =>
  <T1 extends OperandType>(...firstExpectedTypes: T1[]) =>
  <T2 extends OperandType>(
    ...secondExpectedTypes: [...T2[], T2 | SecondOperandErrorCallback<T1>]
  ): [first: Operand<T1>, second: Operand<T2>] => {
    const parseOperand = createSingleOperandParser.bind(null, tokens)

    const firstOperand = parseOperand(index)(...firstExpectedTypes)
    checkComma(tokens[index + 1])
    let secondOperand: Operand<T2>
    let callback: SecondOperandErrorCallback<T1> | undefined
    if (typeof secondExpectedTypes[secondExpectedTypes.length - 1] === 'function') {
      callback = secondExpectedTypes.pop() as SecondOperandErrorCallback<T1>
    }
    try {
      secondOperand = parseOperand(index + 2)(...(secondExpectedTypes as T2[]))
    } catch (e) {
      if (e instanceof OperandTypeError && callback !== undefined) {
        callback(firstOperand.type, tokens[index + 2])
      }
      throw e
    }
    return [firstOperand, secondOperand]
  }

const parseStatement = (tokens: Token[], index: number): Statement => {
  let token = tokens[index]

  const label = parseLabel(tokens, index)
  if (label !== null) {
    index++
    token = tokens[index]
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
      let instrOpcode: Opcode

      switch (instruction as InstructionWithNoOperand) {
        case Instruction.END:
          instrOpcode = Opcode.END
          break
        case Instruction.PUSHF:
          instrOpcode = Opcode.PUSHF
          break
        case Instruction.POPF:
          instrOpcode = Opcode.POPF
          break
        case Instruction.RET:
          instrOpcode = Opcode.POPF
          break
        case Instruction.IRET:
          instrOpcode = Opcode.IRET
          break
        case Instruction.HALT:
          instrOpcode = Opcode.HALT
          break
        case Instruction.NOP:
          instrOpcode = Opcode.NOP
          break
        case Instruction.CLO:
          instrOpcode = Opcode.CLO
          break
        case Instruction.CLI:
          instrOpcode = Opcode.CLI
          break
        case Instruction.STI:
          instrOpcode = Opcode.STI
      }

      opcodes.push(instrOpcode)
      break
    }
    case 1: {
      let operand
      let instrOpcode: Opcode | null

      const parseOperand = createSingleOperandParser(tokens, index)

      switch (instruction as InstructionWithOneOperand) {
        case Instruction.INC:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.INC_REG
          break
        case Instruction.DEC:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.DEC_REG
          break
        case Instruction.NOT:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.NOT_REG
          break
        case Instruction.ROL:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.ROL_REG
          break
        case Instruction.ROR:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.ROR_REG
          break
        case Instruction.SHL:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.SHL_REG
          break
        case Instruction.SHR:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.SHR_REG
          break
        case Instruction.JMP:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JMP
          break
        case Instruction.JZ:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JZ
          break
        case Instruction.JNZ:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JNZ
          break
        case Instruction.JS:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JS
          break
        case Instruction.JNS:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JNS
          break
        case Instruction.JO:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JO
          break
        case Instruction.JNO:
          operand = parseOperand(OperandType.Label)
          instrOpcode = Opcode.JNO
          break
        case Instruction.PUSH:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.PUSH_FROM_REG
          break
        case Instruction.POP:
          operand = parseOperand(OperandType.Register)
          instrOpcode = Opcode.POP_TO_REG
          break
        case Instruction.CALL:
          operand = parseOperand(OperandType.Number)
          instrOpcode = Opcode.CALL_ADDR_NUM
          break
        case Instruction.INT:
          operand = parseOperand(OperandType.Number)
          instrOpcode = Opcode.INT_ADDR_NUM
          break
        case Instruction.IN:
          operand = parseOperand(OperandType.Number)
          instrOpcode = Opcode.IN_FROM_PORT_TO_AL
          break
        case Instruction.OUT:
          operand = parseOperand(OperandType.Number)
          instrOpcode = Opcode.OUT_FROM_AL_TO_PORT
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
      let instrOpcode: Opcode

      const parseOperands = createDoubleOperandsParser(tokens, index)

      switch (instruction as InstructionWithTwoOperands) {
        case Instruction.ADD:
          ;[firstOperand, secondOperand] = parseOperands(OperandType.Register)(
            OperandType.Register,
            OperandType.Number
          )
          switch (secondOperand.type) {
            case OperandType.Register:
              instrOpcode = Opcode.ADD_REG_TO_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.ADD_NUM_TO_REG
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
              instrOpcode = Opcode.SUB_REG_FROM_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.SUB_NUM_FROM_REG
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
              instrOpcode = Opcode.MUL_REG_BY_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.MUL_REG_BY_NUM
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
              instrOpcode = Opcode.DIV_REG_BY_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.DIV_REG_BY_NUM
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
              instrOpcode = Opcode.MOD_REG_BY_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.MOD_REG_BY_NUM
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
              instrOpcode = Opcode.AND_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.AND_REG_WITH_NUM
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
              instrOpcode = Opcode.OR_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.OR_REG_WITH_NUM
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
              instrOpcode = Opcode.XOR_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.XOR_REG_WITH_NUM
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
                  instrOpcode = Opcode.MOV_NUM_TO_REG
                  break
                case OperandType.Register:
                  throw new OperandTypeError(
                    secondOperand.token,
                    OperandType.Number,
                    OperandType.Address,
                    OperandType.RegisterAddress
                  )
                case OperandType.Address:
                  instrOpcode = Opcode.MOV_ADDR_TO_REG
                  break
                case OperandType.RegisterAddress:
                  instrOpcode = Opcode.MOV_REG_ADDR_TO_REG
                  break
              }
              break
            case OperandType.Address:
              if (secondOperand.type !== OperandType.Register) {
                throw new OperandTypeError(secondOperand.token, OperandType.Register)
              }
              instrOpcode = Opcode.MOV_REG_TO_ADDR
              break
            case OperandType.RegisterAddress:
              if (secondOperand.type !== OperandType.Register) {
                throw new OperandTypeError(secondOperand.token, OperandType.Register)
              }
              instrOpcode = Opcode.MOV_REG_TO_REG_ADDR
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
              instrOpcode = Opcode.CMP_REG_WITH_REG
              break
            case OperandType.Number:
              instrOpcode = Opcode.CMP_REG_WITH_NUM
              break
            case OperandType.Address:
              instrOpcode = Opcode.CMP_REG_WITH_ADDR
              break
          }
      }

      operands.push(firstOperand, secondOperand)
      opcodes.push(instrOpcode)
    }
  }

  if (instruction !== Instruction.ORG) {
    opcodes.push(...Operand.getOpcodes(...operands))
  }

  return new Statement(label, instruction, operands, opcodes, position)
}

export const parse = (tokens: Token[]): Statement[] => {
  const statements: Statement[] = []
  let index = 0
  while (index < tokens.length) {
    const statement = parseStatement(tokens, index)
    statements.push(statement)
    index += statement.getConsumedTokensCount()
  }
  if (statements[statements.length - 1].instruction !== Instruction.END) {
    throw new MissingEndError()
  }
  return statements
}
