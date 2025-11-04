import { Opcode } from '../code'
import * as AST from './ast'

export type OperandPattern =
  | AST.OperandType
  | {
    type: AST.OperandType
    children: OperandPattern[]
  }

export const patterns: Record<AST.Mnemonic, [Opcode, OperandPattern[]][]> = {
  HALT: [
    [Opcode.HALT, []],
  ],
  ADD: [
    [Opcode.ADD_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.ADD_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  SUB: [
    [Opcode.SUB_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.SUB_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  MUL: [
    [Opcode.MUL_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.MUL_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  DIV: [
    [Opcode.DIV_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.DIV_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  INC: [
    [Opcode.INC_REG, [AST.NodeType.Register]],
  ],
  DEC: [
    [Opcode.DEC_REG, [AST.NodeType.Register]],
  ],
  MOD: [
    [Opcode.MOD_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.MOD_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  AND: [
    [Opcode.AND_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.AND_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  OR: [
    [Opcode.OR_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.OR_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  XOR: [
    [Opcode.XOR_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.XOR_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
  ],
  NOT: [
    [Opcode.NOT_REG, [AST.NodeType.Register]],
  ],
  ROL: [
    [Opcode.ROL_REG, [AST.NodeType.Register]],
  ],
  ROR: [
    [Opcode.ROR_REG, [AST.NodeType.Register]],
  ],
  SHL: [
    [Opcode.SHL_REG, [AST.NodeType.Register]],
  ],
  SHR: [
    [Opcode.SHR_REG, [AST.NodeType.Register]],
  ],
  JMP: [
    [Opcode.JMP, [AST.NodeType.Identifier]],
  ],
  JZ: [
    [Opcode.JZ, [AST.NodeType.Identifier]],
  ],
  JNZ: [
    [Opcode.JNZ, [AST.NodeType.Identifier]],
  ],
  JS: [
    [Opcode.JS, [AST.NodeType.Identifier]],
  ],
  JNS: [
    [Opcode.JNS, [AST.NodeType.Identifier]],
  ],
  JO: [
    [Opcode.JO, [AST.NodeType.Identifier]],
  ],
  JNO: [
    [Opcode.JNO, [AST.NodeType.Identifier]],
  ],
  MOV: [
    [Opcode.MOV_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
    [Opcode.MOV_REG_ADDR, [
      AST.NodeType.Register,
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Immediate] },
    ]],
    [Opcode.MOV_ADDR_REG, [
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Immediate] },
      AST.NodeType.Register,
    ]],
    [Opcode.MOV_REG_REG_ADDR, [
      AST.NodeType.Register,
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Register] },
    ]],
    [Opcode.MOV_REG_ADDR_REG, [
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Register] },
      AST.NodeType.Register,
    ]],
  ],
  CMP: [
    [Opcode.CMP_REG_REG, [AST.NodeType.Register, AST.NodeType.Register]],
    [Opcode.CMP_REG_IMM, [AST.NodeType.Register, AST.NodeType.Immediate]],
    [Opcode.CMP_REG_ADDR, [
      AST.NodeType.Register,
      { type: AST.NodeType.MemoryOperand, children: [AST.NodeType.Immediate] },
    ]],
  ],
  PUSH: [
    [Opcode.PUSH_REG, [AST.NodeType.Register]],
  ],
  POP: [
    [Opcode.POP_REG, [AST.NodeType.Register]],
  ],
  PUSHF: [
    [Opcode.PUSHF, []],
  ],
  POPF: [
    [Opcode.POPF, []],
  ],
  CALL: [
    [Opcode.CALL_ADDR, [AST.NodeType.Immediate]],
  ],
  RET: [
    [Opcode.RET, []],
  ],
  INT: [
    [Opcode.INT_ADDR, [AST.NodeType.Immediate]],
  ],
  IRET: [
    [Opcode.IRET, []],
  ],
  IN: [
    [Opcode.IN_IMM, [AST.NodeType.Immediate]],
  ],
  OUT: [
    [Opcode.OUT_IMM, [AST.NodeType.Immediate]],
  ],
  STI: [
    [Opcode.STI, []],
  ],
  CLI: [
    [Opcode.CLI, []],
  ],
  CLO: [
    [Opcode.CLO, []],
  ],
  NOP: [
    [Opcode.NOP, []],
  ],
}
