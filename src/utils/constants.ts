export const enum Keyword {
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

export type ArithmeticKeyword = Extract<
  Keyword,
  Keyword.ADD | Keyword.SUB | Keyword.MUL | Keyword.DIV
>

type ArgsCount = 0 | 1 | 2

export const ARGS_COUNT: { [keyword in Keyword]: ArgsCount } = {
  [Keyword.MOV]: 2,
  [Keyword.ADD]: 2,
  [Keyword.SUB]: 2,
  [Keyword.MUL]: 2,
  [Keyword.DIV]: 2,
  [Keyword.INC]: 1,
  [Keyword.DEC]: 1,
  [Keyword.CMP]: 2,
  [Keyword.JMP]: 1,
  [Keyword.JZ]: 1,
  [Keyword.JNZ]: 1,
  [Keyword.END]: 0
}

export const enum ArgType {
  Number = 'Number',
  Address = 'Address',
  Register = 'Register',
  RegisterPointer = 'RegisterPointer',
  Illegal = 'Illegal'
}

type ValidArgTypeRegex = {
  [argType in Exclude<ArgType, ArgType.Illegal>]: RegExp
}

export const ARG_TYPE_REGEX: ValidArgTypeRegex = {
  [ArgType.Number]: /^([0-9A-F]{1,2})$/,
  [ArgType.Address]: /^\[([0-9A-F]{1,2})\]$/,
  [ArgType.Register]: /^([ABCD]L)$/,
  [ArgType.RegisterPointer]: /^\[([ABCD]L)\]$/
}

export const enum Register {
  AL = 'AL',
  BL = 'BL',
  CL = 'CL',
  DL = 'DL'
}

export type RegisterCode = 0x00 | 0x01 | 0x02 | 0x03

export const REGISTER_CODE: { [name in Register]: RegisterCode } = {
  [Register.AL]: 0x00,
  [Register.BL]: 0x01,
  [Register.CL]: 0x02,
  [Register.DL]: 0x03
}

type OpcodeMappingValue = [number, number] | number

type OpcodeMapping = {
  [keyword in Exclude<Keyword, Keyword.MOV | Keyword.CMP>]: OpcodeMappingValue
}

export const OPCODE_MAPPING: OpcodeMapping = {
  [Keyword.ADD]: [0xa0, 0xb0],
  [Keyword.SUB]: [0xa1, 0xb1],
  [Keyword.MUL]: [0xa2, 0xb2],
  [Keyword.DIV]: [0xa3, 0xb6],
  [Keyword.INC]: 0xa4,
  [Keyword.DEC]: 0xa5,
  [Keyword.JMP]: 0xc0,
  [Keyword.JZ]: 0xc1,
  [Keyword.JNZ]: 0xc2,
  [Keyword.END]: 0x00
}
