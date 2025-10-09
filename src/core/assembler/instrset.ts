import * as AST from './ast'

export type OperandPattern
  = | AST.OperandType
    | {
      type: AST.OperandType
      children: OperandPattern[]
    }

export const patterns: Record<AST.Mnemonic, [number, OperandPattern[]][]> = {
  ADD: [
    [0xa0, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xb0, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  SUB: [
    [0xa1, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xb1, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  MUL: [
    [0xa2, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xb2, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  DIV: [
    [0xa3, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xb3, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  INC: [
    [0xa4, [AST.NodeType.Register]],
  ],
  DEC: [
    [0xa5, [AST.NodeType.Register]],
  ],
  MOD: [
    [0xa6, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xb6, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  AND: [
    [0xaa, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xba, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  OR: [
    [0xab, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xbb, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  XOR: [
    [0xac, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xbc, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  NOT: [
    [0xad, [AST.NodeType.Register]],
  ],
  ROL: [
    [0x9a, [AST.NodeType.Register]],
  ],
  ROR: [
    [0x9b, [AST.NodeType.Register]],
  ],
  SHL: [
    [0x9c, [AST.NodeType.Register]],
  ],
  SHR: [
    [0x9d, [AST.NodeType.Register]],
  ],
  JMP: [
    [0xc0, [AST.NodeType.Identifier]],
  ],
  JZ: [
    [0xc1, [AST.NodeType.Identifier]],
  ],
  JNZ: [
    [0xc2, [AST.NodeType.Identifier]],
  ],
  JS: [
    [0xc3, [AST.NodeType.Identifier]],
  ],
  JNS: [
    [0xc4, [AST.NodeType.Identifier]],
  ],
  JO: [
    [0xc5, [AST.NodeType.Identifier]],
  ],
  JNO: [
    [0xc6, [AST.NodeType.Identifier]],
  ],
  MOV: [
    [0xd0, [AST.NodeType.Register, AST.NodeType.Immediate]],
    [0xd1, [
      AST.NodeType.Register,
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Immediate] },
    ]],
    [0xd2, [
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Immediate] },
      AST.NodeType.Register,
    ]],
    [0xd3, [
      AST.NodeType.Register,
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Register] },
    ]],
    [0xd4, [
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Register] },
      AST.NodeType.Register,
    ]],
  ],
  CMP: [
    [0xda, [AST.NodeType.Register, AST.NodeType.Register]],
    [0xdb, [AST.NodeType.Register, AST.NodeType.Immediate]],
    [0xdc, [
      AST.NodeType.Register,
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Immediate] },
    ]],
  ],
  PUSH: [
    [0xe0, [AST.NodeType.Register]],
  ],
  POP: [
    [0xe1, [AST.NodeType.Register]],
  ],
  PUSHF: [
    [0xea, []],
  ],
  POPF: [
    [0xeb, []],
  ],
  CALL: [
    [0xca, [AST.NodeType.Immediate]],
  ],
  RET: [
    [0xcb, []],
  ],
  INT: [
    [0xcc, [AST.NodeType.Immediate]],
  ],
  IRET: [
    [0xcd, []],
  ],
  IN: [
    [0xf0, [AST.NodeType.Immediate]],
  ],
  OUT: [
    [0xf1, [AST.NodeType.Immediate]],
  ],
  HALT: [
    [0x00, []],
  ],
  STI: [
    [0xfc, []],
  ],
  CLI: [
    [0xfd, []],
  ],
  CLO: [
    [0xfe, []],
  ],
  NOP: [
    [0xff, []],
  ],
}

export enum Register {
  AL = 0x00,
  BL = 0x01,
  CL = 0x02,
  DL = 0x03,
}
