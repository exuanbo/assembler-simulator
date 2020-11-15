const enum ArgTypeEnum {
  Number,
  Address,
  Register,
  RegisterPointer,
  Illegal
}

export type ArgType = keyof typeof ArgTypeEnum

const enum RegisterEnum {
  AL,
  BL,
  CL,
  DL
}

export type Register = keyof typeof RegisterEnum

export const ARGS_COUNT = {
  MOV: 2,
  ADD: 2,
  SUB: 2,
  MUL: 2,
  DIV: 2,
  INC: 1,
  DEC: 1,
  CMP: 2,
  JMP: 1,
  JZ: 1,
  JNZ: 1,
  END: 0
}

export const OPCODE_MAPPING = {
  ADD: [0xa0, 0xb0],
  SUB: [0xa1, 0xb1],
  MUL: [0xa2, 0xb2],
  DIV: [0xa3, 0xb6],
  INC: 0xa4,
  DEC: 0x05
}

type RegisterCodes = {
  [name in Register]: number
}

export const REGISTER_CODES: RegisterCodes = {
  AL: 0x00,
  BL: 0x01,
  CL: 0x02,
  DL: 0x03
}

type Regex = {
  [regexType in Exclude<ArgType, 'Illegal'>]: RegExp
}

export const REGEX: Regex = {
  Number: /^([0-9A-F]{1,2})$/,
  Address: /^\[([0-9A-F]{1,2})\]$/,
  Register: /^([ABCD]L)$/,
  RegisterPointer: /^\[([ABCD]L)\]$/
}
