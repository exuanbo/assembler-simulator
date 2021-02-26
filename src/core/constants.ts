export enum Instruction {
  MOV = 'MOV',
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  INC = 'INC',
  DEC = 'DEC',
  CMP = 'CMP',
  JMP = 'JMP',
  JZ = 'JZ',
  JNZ = 'JNZ',
  END = 'END'
}

export type MovOpcode = 0xd0 | 0xd1 | 0xd3 | 0xd2 | 0xd4

export type ArithmeticInstruction = Extract<
  Instruction,
  | Instruction.ADD
  | Instruction.SUB
  | Instruction.MUL
  | Instruction.DIV
  | Instruction.INC
  | Instruction.DEC
>

export type ArithmeticOpcode =
  | DirectArithmeticOpcode
  | ImmediateArithmeticOpcode

type DirectArithmeticOpcode = 0xa0 | 0xa1 | 0xa2 | 0xa3 | 0xa4 | 0xa5

export const DIRECT_ARITHMETIC_OPCODE_MAP: {
  [instruction in ArithmeticInstruction]: DirectArithmeticOpcode
} = {
  [Instruction.ADD]: 0xa0,
  [Instruction.SUB]: 0xa1,
  [Instruction.MUL]: 0xa2,
  [Instruction.DIV]: 0xa3,
  [Instruction.INC]: 0xa4,
  [Instruction.DEC]: 0xa5
}

export type ImmediateArithmeticInstruction = Extract<
  Instruction,
  Instruction.ADD | Instruction.SUB | Instruction.MUL | Instruction.DIV
>

type ImmediateArithmeticOpcode = 0xb0 | 0xb1 | 0xb2 | 0xb6

export const IMMEDIATE_ARITHMETIC_OPCODE_MAP: {
  [instruction in ImmediateArithmeticInstruction]: ImmediateArithmeticOpcode
} = {
  [Instruction.ADD]: 0xb0,
  [Instruction.SUB]: 0xb1,
  [Instruction.MUL]: 0xb2,
  [Instruction.DIV]: 0xb6
}

export type CompareOpcode = 0xda | 0xdc | 0xdb

type BranchInstruction = Extract<
  Instruction,
  Instruction.JMP | Instruction.JZ | Instruction.JNZ
>

type BranchOpcode = 0xc0 | 0xc1 | 0xc2

export const BRANCH_OPCODE_MAP: {
  [instruction in BranchInstruction]: BranchOpcode
} = {
  [Instruction.JMP]: 0xc0,
  [Instruction.JZ]: 0xc1,
  [Instruction.JNZ]: 0xc2
}

type OperandsCount = 0 | 1 | 2

export const INSTRUCTION_OPERANDS_COUNT_MAP: {
  [instruction in Instruction]: OperandsCount
} = {
  [Instruction.MOV]: 2,
  [Instruction.ADD]: 2,
  [Instruction.SUB]: 2,
  [Instruction.MUL]: 2,
  [Instruction.DIV]: 2,
  [Instruction.INC]: 1,
  [Instruction.DEC]: 1,
  [Instruction.CMP]: 2,
  [Instruction.JMP]: 1,
  [Instruction.JZ]: 1,
  [Instruction.JNZ]: 1,
  [Instruction.END]: 0
}

export enum OperandType {
  Number = 'Number',
  Address = 'Address',
  Register = 'Register',
  RegisterPointer = 'RegisterPointer'
}

export const OPERAND_TYPE_REGEX_MAP: {
  [operandType in OperandType]: RegExp
} = {
  [OperandType.Number]: /^([0-9A-F]{1,2})$/,
  [OperandType.Address]: /^\[([0-9A-F]{1,2})\]$/,
  [OperandType.Register]: /^([ABCD]L)$/,
  [OperandType.RegisterPointer]: /^\[([ABCD]L)\]$/
}

export enum Register {
  AL = 'AL',
  BL = 'BL',
  CL = 'CL',
  DL = 'DL'
}

type RegisterCode = 0x00 | 0x01 | 0x02 | 0x03

export const REGISTER_CODE_MAP: { [register in Register]: RegisterCode } = {
  [Register.AL]: 0x00,
  [Register.BL]: 0x01,
  [Register.CL]: 0x02,
  [Register.DL]: 0x03
}
