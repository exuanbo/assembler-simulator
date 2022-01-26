export enum Mnemonic {
  END = 'END',

  // Arithmetic
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  INC = 'INC',
  DEC = 'DEC',
  MOD = 'MOD',

  // Logic
  AND = 'AND',
  OR = 'OR',
  XOR = 'XOR',
  NOT = 'NOT',

  // Bitwise
  ROL = 'ROL',
  ROR = 'ROR',
  SHL = 'SHL',
  SHR = 'SHR',

  // Jump
  JMP = 'JMP',
  JZ = 'JZ',
  JNZ = 'JNZ',
  JS = 'JS',
  JNS = 'JNS',
  JO = 'JO',
  JNO = 'JNO',

  // Move
  MOV = 'MOV',

  // Compare
  CMP = 'CMP',

  // Stack
  PUSH = 'PUSH',
  POP = 'POP',
  PUSHF = 'PUSHF',
  POPF = 'POPF',

  // Procedures and Interrupts
  CALL = 'CALL',
  RET = 'RET',
  INT = 'INT',
  IRET = 'IRET',

  // Input and Output
  IN = 'IN',
  OUT = 'OUT',

  // Miscellaneous
  HALT = 'HALT',
  STI = 'STI',
  CLI = 'CLI',
  CLO = 'CLO',
  NOP = 'NOP',
  ORG = 'ORG',
  DB = 'DB'
}

export const MnemonicToOperandsCountMap = {
  [Mnemonic.END]: 0,

  // Arithmetic
  [Mnemonic.ADD]: 2,
  [Mnemonic.SUB]: 2,
  [Mnemonic.MUL]: 2,
  [Mnemonic.DIV]: 2,
  [Mnemonic.INC]: 1,
  [Mnemonic.DEC]: 1,
  [Mnemonic.MOD]: 2,

  // Logic
  [Mnemonic.AND]: 2,
  [Mnemonic.OR]: 2,
  [Mnemonic.XOR]: 2,
  [Mnemonic.NOT]: 1,

  // Bitwise
  [Mnemonic.ROL]: 1,
  [Mnemonic.ROR]: 1,
  [Mnemonic.SHL]: 1,
  [Mnemonic.SHR]: 1,

  // Jump
  [Mnemonic.JMP]: 1,
  [Mnemonic.JZ]: 1,
  [Mnemonic.JNZ]: 1,
  [Mnemonic.JS]: 1,
  [Mnemonic.JNS]: 1,
  [Mnemonic.JO]: 1,
  [Mnemonic.JNO]: 1,

  // Move
  [Mnemonic.MOV]: 2,

  // Compare
  [Mnemonic.CMP]: 2,

  // Stack
  [Mnemonic.PUSH]: 1,
  [Mnemonic.POP]: 1,
  [Mnemonic.PUSHF]: 0,
  [Mnemonic.POPF]: 0,

  // Procedures and Interrupts
  [Mnemonic.CALL]: 1,
  [Mnemonic.RET]: 0,
  [Mnemonic.INT]: 1,
  [Mnemonic.IRET]: 0,

  // Input and Output
  [Mnemonic.IN]: 1,
  [Mnemonic.OUT]: 1,

  // Miscellaneous
  [Mnemonic.HALT]: 0,
  [Mnemonic.STI]: 0,
  [Mnemonic.CLI]: 0,
  [Mnemonic.CLO]: 0,
  [Mnemonic.NOP]: 0,
  [Mnemonic.ORG]: 1,
  [Mnemonic.DB]: 1
} as const

export enum Opcode {
  END = 0x00,

  // Direct Arithmetic
  ADD_REG_TO_REG = 0xa0,
  SUB_REG_FROM_REG = 0xa1,
  MUL_REG_BY_REG = 0xa2,
  DIV_REG_BY_REG = 0xa3,
  INC_REG = 0xa4,
  DEC_REG = 0xa5,
  MOD_REG_BY_REG = 0xa6,
  AND_REG_WITH_REG = 0xaa,
  OR_REG_WITH_REG = 0xab,
  XOR_REG_WITH_REG = 0xac,
  NOT_REG = 0xad,
  ROL_REG = 0x9a,
  ROR_REG = 0x9b,
  SHL_REG = 0x9c,
  SHR_REG = 0x9d,

  // Immediate Arithmetic
  ADD_NUM_TO_REG = 0xb0,
  SUB_NUM_FROM_REG = 0xb1,
  MUL_REG_BY_NUM = 0xb2,
  DIV_REG_BY_NUM = 0xb3,
  MOD_REG_BY_NUM = 0xb6,
  AND_REG_WITH_NUM = 0xba,
  OR_REG_WITH_NUM = 0xbb,
  XOR_REG_WITH_NUM = 0xbc,

  // Jump
  JMP = 0xc0,
  JZ = 0xc1,
  JNZ = 0xc2,
  JS = 0xc3,
  JNS = 0xc4,
  JO = 0xc5,
  JNO = 0xc6,

  // Immediate Move
  MOV_NUM_TO_REG = 0xd0,

  // Direct Move
  MOV_ADDR_TO_REG = 0xd1,
  MOV_REG_TO_ADDR = 0xd2,

  // Indirect Move
  MOV_REG_ADDR_TO_REG = 0xd3,
  MOV_REG_TO_REG_ADDR = 0xd4,

  // Direct Register Comparison
  CMP_REG_WITH_REG = 0xda,

  // Immediate Comparison
  CMP_REG_WITH_NUM = 0xdb,

  // Direct Memory Comparison
  CMP_REG_WITH_ADDR = 0xdc,

  // Stack
  PUSH_FROM_REG = 0xe0,
  POP_TO_REG = 0xe1,
  PUSHF = 0xea,
  POPF = 0xeb,

  // Procedures and Interrupts
  CALL_ADDR = 0xca,
  RET = 0xcb,
  INT_ADDR = 0xcc,
  IRET = 0xcd,

  // Input and Output
  IN_FROM_PORT_TO_AL = 0xf0,
  OUT_FROM_AL_TO_PORT = 0xf1,

  // Miscellaneous
  HALT = 0x00,
  STI = 0xfc,
  CLI = 0xfd,
  CLO = 0xfe,
  NOP = 0xff
}

export const SPACE_ASCII = 0x20

export const NO_BREAK_SPACE = '\u00A0'
