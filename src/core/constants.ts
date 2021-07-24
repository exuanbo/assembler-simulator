export enum Instruction {
  END = 'END',

  // Arithmetic
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  MOD = 'MOD',
  INC = 'INC',
  DEC = 'DEC',

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
  NOP = 'NOP',
  CLO = 'CLO',
  ORG = 'ORG',
  DB = 'DB',
  CLI = 'CLI',
  STI = 'STI'
}

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
  CALL_ADDR_NUM = 0xca,
  RET = 0xcb,
  INT_ADDR_NUM = 0xcc,
  IRET = 0xcd,

  // Input and Output
  IN_FROM_PORT_TO_AL = 0xf0,
  OUT_FROM_AL_TO_PORT = 0xf1,

  // Miscellaneous
  HALT = 0x00,
  NOP = 0xff,
  CLO = 0xfe,
  CLI = 0xfd,
  STI = 0xfc
}

export const INSTRUCTION_OPERANDS_COUNT_MAP = {
  [Instruction.END]: 0,

  // Arithmetic
  [Instruction.ADD]: 2,
  [Instruction.SUB]: 2,
  [Instruction.MUL]: 2,
  [Instruction.DIV]: 2,
  [Instruction.MOD]: 2,
  [Instruction.INC]: 1,
  [Instruction.DEC]: 1,

  // Logic
  [Instruction.AND]: 2,
  [Instruction.OR]: 2,
  [Instruction.XOR]: 2,
  [Instruction.NOT]: 1,

  // Bitwise
  [Instruction.ROL]: 1,
  [Instruction.ROR]: 1,
  [Instruction.SHL]: 1,
  [Instruction.SHR]: 1,

  // Jump
  [Instruction.JMP]: 1,
  [Instruction.JZ]: 1,
  [Instruction.JNZ]: 1,
  [Instruction.JS]: 1,
  [Instruction.JNS]: 1,
  [Instruction.JO]: 1,
  [Instruction.JNO]: 1,

  // Move
  [Instruction.MOV]: 2,

  // Compare
  [Instruction.CMP]: 2,

  // Stack
  [Instruction.PUSH]: 1,
  [Instruction.POP]: 1,
  [Instruction.PUSHF]: 0,
  [Instruction.POPF]: 0,

  // Procedures and Interrupts
  [Instruction.CALL]: 1,
  [Instruction.RET]: 0,
  [Instruction.INT]: 1,
  [Instruction.IRET]: 0,

  // Input and Output
  [Instruction.IN]: 1,
  [Instruction.OUT]: 1,

  // Miscellaneous
  [Instruction.HALT]: 0,
  [Instruction.NOP]: 0,
  [Instruction.CLO]: 0,
  [Instruction.ORG]: 1,
  [Instruction.DB]: 1,
  [Instruction.CLI]: 0,
  [Instruction.STI]: 0
} as const

export type InstructionWithNoOperand =
  | Instruction.END
  | Instruction.PUSHF
  | Instruction.POPF
  | Instruction.RET
  | Instruction.IRET
  | Instruction.HALT
  | Instruction.NOP
  | Instruction.CLO
  | Instruction.CLI
  | Instruction.STI

export type InstructionWithOneOperand =
  | Instruction.INC
  | Instruction.DEC
  | Instruction.NOT
  | Instruction.ROL
  | Instruction.ROR
  | Instruction.SHL
  | Instruction.SHR
  | Instruction.JMP
  | Instruction.JZ
  | Instruction.JNZ
  | Instruction.JS
  | Instruction.JNS
  | Instruction.JO
  | Instruction.JNO
  | Instruction.PUSH
  | Instruction.POP
  | Instruction.CALL
  | Instruction.INT
  | Instruction.IN
  | Instruction.OUT
  | Instruction.ORG
  | Instruction.DB

export type InstructionWithTwoOperands =
  | Instruction.ADD
  | Instruction.SUB
  | Instruction.MUL
  | Instruction.DIV
  | Instruction.MOD
  | Instruction.AND
  | Instruction.OR
  | Instruction.XOR
  | Instruction.MOV
  | Instruction.CMP

export enum Register {
  AL = 'AL',
  BL = 'BL',
  CL = 'CL',
  DL = 'DL'
}

export const REGISTER_CODE_MAP = {
  [Register.AL]: 0x00,
  [Register.BL]: 0x01,
  [Register.CL]: 0x02,
  [Register.DL]: 0x03
} as const
