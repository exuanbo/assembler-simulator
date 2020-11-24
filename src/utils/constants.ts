export enum Keyword {
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

export enum JumpKeyword {
  JMP = Keyword.JMP,
  JZ = Keyword.JZ,
  JNZ = Keyword.JNZ
}

export type ArithmeticKeyword = Extract<
  Keyword,
  Keyword.ADD | Keyword.SUB | Keyword.MUL | Keyword.DIV
>

export type StaticOpcodeKeyword = Extract<
  Keyword,
  | Keyword.INC
  | Keyword.DEC
  | Keyword.JMP
  | Keyword.JZ
  | Keyword.JNZ
  | Keyword.END
>

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

export enum ArgType {
  Number = 'Number',
  Address = 'Address',
  Register = 'Register',
  RegisterPointer = 'RegisterPointer',
  Invalid = 'Invalid'
}

type ValidArgTypeRegex = {
  [argType in Exclude<ArgType, ArgType.Invalid>]: RegExp
}

export const ARG_TYPE_REGEX: ValidArgTypeRegex = {
  [ArgType.Number]: /^([0-9A-F]{1,2})$/,
  [ArgType.Address]: /^\[([0-9A-F]{1,2})\]$/,
  [ArgType.Register]: /^([ABCD]L)$/,
  [ArgType.RegisterPointer]: /^\[([ABCD]L)\]$/
}

export enum Register {
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
