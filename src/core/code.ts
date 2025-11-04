export enum Opcode {
  HALT = 0x00,

  // Direct Arithmetic
  ADD_REG_REG = 0xa0,
  SUB_REG_REG = 0xa1,
  MUL_REG_REG = 0xa2,
  DIV_REG_REG = 0xa3,
  INC_REG = 0xa4,
  DEC_REG = 0xa5,
  MOD_REG_REG = 0xa6,
  AND_REG_REG = 0xaa,
  OR_REG_REG = 0xab,
  XOR_REG_REG = 0xac,
  NOT_REG = 0xad,
  ROL_REG = 0x9a,
  ROR_REG = 0x9b,
  SHL_REG = 0x9c,
  SHR_REG = 0x9d,

  // Immediate Arithmetic
  ADD_REG_IMM = 0xb0,
  SUB_REG_IMM = 0xb1,
  MUL_REG_IMM = 0xb2,
  DIV_REG_IMM = 0xb3,
  MOD_REG_IMM = 0xb6,
  AND_REG_IMM = 0xba,
  OR_REG_IMM = 0xbb,
  XOR_REG_IMM = 0xbc,

  // Jump
  JMP = 0xc0,
  JZ = 0xc1,
  JNZ = 0xc2,
  JS = 0xc3,
  JNS = 0xc4,
  JO = 0xc5,
  JNO = 0xc6,

  // Immediate Move
  MOV_REG_IMM = 0xd0,

  // Direct Move
  MOV_REG_ADDR = 0xd1,
  MOV_ADDR_REG = 0xd2,

  // Indirect Move
  MOV_REG_REG_ADDR = 0xd3,
  MOV_REG_ADDR_REG = 0xd4,

  // Direct Register Comparison
  CMP_REG_REG = 0xda,

  // Immediate Comparison
  CMP_REG_IMM = 0xdb,

  // Direct Memory Comparison
  CMP_REG_ADDR = 0xdc,

  // Stack
  PUSH_REG = 0xe0,
  POP_REG = 0xe1,
  PUSHF = 0xea,
  POPF = 0xeb,

  // Procedures and Interrupts
  CALL_ADDR = 0xca,
  RET = 0xcb,
  INT_ADDR = 0xcc,
  IRET = 0xcd,

  // Input and Output
  IN_IMM = 0xf0,
  OUT_IMM = 0xf1,

  // Miscellaneous
  STI = 0xfc,
  CLI = 0xfd,
  CLO = 0xfe,
  NOP = 0xff,
}

export enum Register {
  AL = 0x00,
  BL = 0x01,
  CL = 0x02,
  DL = 0x03,
}
