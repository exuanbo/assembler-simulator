import { invariant } from '@/common/utils/invariant'

export interface Node {
  type: NodeType
  loc: SourceLocation
}

export const enum NodeType {
  Program,
  Comment,
  Label,
  Instruction,
  Directive,
  MemoryOperand,
  Register,
  Identifier,
  Immediate,
  StringLiteral,
}

const nodenames: Partial<Record<NodeType, string>> = {
  [NodeType.Label]:         'label',
  [NodeType.Instruction]:   'instruction',
  [NodeType.Directive]:     'directive',
  [NodeType.MemoryOperand]: 'address',
  [NodeType.Register]:      'register',
  [NodeType.Identifier]:    'identifier',
  [NodeType.Immediate]:     'number',
  [NodeType.StringLiteral]: 'string',
}

export function getNodeName(type: NodeType): string {
  const name = nodenames[type]
  invariant(name, `Node name of type '${type}' is undefined`)
  return name
}

export interface SourceLocation {
  start: Position
  end: Position
}

export interface Position {
  line: number
  column: number
  offset: number
}

export interface Program extends Node {
  type: NodeType.Program
  comments: Comment[]
  statements: Statement[]
}

export interface Comment extends Node {
  type: NodeType.Comment
  value: string
}

export type Statement = Label | Instruction | Directive

export interface Label extends Node {
  type: NodeType.Label
  identifier: Identifier
}

export type Instruction =
  | Arithmetic
  | Jump
  | Move
  | Compare
  | Stack
  | Procedure
  | Interrupt
  | InputOutput
  | Control

interface BaseInstruction extends Node {
  type: NodeType.Instruction
  children: [
    Mnemonic,
    ...Operand[],
  ]
  mnemonic: Mnemonic
}

export type Operand = MemoryOperand | Register | Identifier | Immediate

export type OperandType<TOperand = Operand> =
  TOperand extends { type: infer Type, children: (infer Value)[] }
    ? Type | OperandType<Value>
    : never

export type OperandValue<TOperand = Operand> =
  TOperand extends { children: (infer Value)[] }
    ? Value | OperandValue<Value>
    : never

export type Arithmetic = UnaryArithmetic | BinaryArithmetic

export interface UnaryArithmetic extends BaseInstruction {
  children: [
    UnaryArithmetic['mnemonic'],
    destination: Register,
  ]
  mnemonic:
    | Mnemonic.INC
    | Mnemonic.DEC
    | Mnemonic.NOT
    | Mnemonic.ROL
    | Mnemonic.ROR
    | Mnemonic.SHL
    | Mnemonic.SHR
}

export interface BinaryArithmetic extends BaseInstruction {
  children: [
    BinaryArithmetic['mnemonic'],
    destination: Register,
    source: Register | Immediate,
  ]
  mnemonic:
    | Mnemonic.ADD
    | Mnemonic.SUB
    | Mnemonic.MUL
    | Mnemonic.DIV
    | Mnemonic.MOD
    | Mnemonic.AND
    | Mnemonic.OR
    | Mnemonic.XOR
}

export interface Jump extends BaseInstruction {
  children: [
    Jump['mnemonic'],
    label: Identifier,
  ]
  mnemonic:
    | Mnemonic.JMP
    | Mnemonic.JZ
    | Mnemonic.JNZ
    | Mnemonic.JS
    | Mnemonic.JNS
    | Mnemonic.JO
    | Mnemonic.JNO
}

export interface Move extends BaseInstruction {
  children: [
    Move['mnemonic'],
    destination: Register | MemoryOperand,
    source: Immediate | MemoryOperand | Register,
  ]
  mnemonic: Mnemonic.MOV
}

export interface Compare extends BaseInstruction {
  children: [
    Compare['mnemonic'],
    left: Register,
    right: Register | Immediate | MemoryOperand,
  ]
  mnemonic: Mnemonic.CMP

}

export type Stack = GeneralStack | FlagStack

export interface GeneralStack extends BaseInstruction {
  children: [
    GeneralStack['mnemonic'],
    register: Register,
  ]
  mnemonic: Mnemonic.PUSH | Mnemonic.POP

}

export interface FlagStack extends BaseInstruction {
  children: [
    FlagStack['mnemonic'],
  ]
  mnemonic: Mnemonic.PUSHF | Mnemonic.POPF
}

export type Procedure = CallProcedure | ReturnProcedure

export interface CallProcedure extends BaseInstruction {
  children: [
    CallProcedure['mnemonic'],
    address: Immediate,
  ]
  mnemonic: Mnemonic.CALL

}

export interface ReturnProcedure extends BaseInstruction {
  children: [
    ReturnProcedure['mnemonic'],
  ]
  mnemonic: Mnemonic.RET
}

export type Interrupt = TrapInterrupt | ReturnInterrupt

export interface TrapInterrupt extends BaseInstruction {
  children: [
    TrapInterrupt['mnemonic'],
    vector: Immediate,
  ]
  mnemonic: Mnemonic.INT

}

export interface ReturnInterrupt extends BaseInstruction {
  children: [
    ReturnInterrupt['mnemonic'],
  ]
  mnemonic: Mnemonic.IRET
}

export interface InputOutput extends BaseInstruction {
  children: [
    InputOutput['mnemonic'],
    port: Immediate,
  ]
  mnemonic: Mnemonic.IN | Mnemonic.OUT

}

export interface Control extends BaseInstruction {
  children: [
    Control['mnemonic'],
  ]
  mnemonic:
    | Mnemonic.HALT
    | Mnemonic.STI
    | Mnemonic.CLI
    | Mnemonic.CLO
    | Mnemonic.NOP
}

export type Directive = End | Org | Db

interface BaseDirective extends Node {
  type: NodeType.Directive
  name: DirectiveName
}

export interface End extends BaseDirective {
  name: DirectiveName.END
}

export interface Org extends BaseDirective {
  name: DirectiveName.ORG
  address: Immediate
}

export interface Db extends BaseDirective {
  children: [Immediate | StringLiteral]
  name: DirectiveName.DB
}

export interface MemoryOperand extends Node {
  type: NodeType.MemoryOperand
  children: [Register | Immediate]
}

export interface Register extends Node {
  type: NodeType.Register
  children: [RegisterName]
}

export interface Identifier extends Node {
  type: NodeType.Identifier
  children: [IdentifierValue]
}

export type IdentifierValue = string

export interface Immediate extends Node {
  type: NodeType.Immediate
  children: [number]
}

export interface StringLiteral extends Node {
  type: NodeType.StringLiteral
  children: string
}

export enum Mnemonic {
  ADD   = 'ADD',
  SUB   = 'SUB',
  MUL   = 'MUL',
  DIV   = 'DIV',
  INC   = 'INC',
  DEC   = 'DEC',
  MOD   = 'MOD',
  AND   = 'AND',
  OR    = 'OR',
  XOR   = 'XOR',
  NOT   = 'NOT',
  ROL   = 'ROL',
  ROR   = 'ROR',
  SHL   = 'SHL',
  SHR   = 'SHR',
  JMP   = 'JMP',
  JZ    = 'JZ',
  JNZ   = 'JNZ',
  JS    = 'JS',
  JNS   = 'JNS',
  JO    = 'JO',
  JNO   = 'JNO',
  MOV   = 'MOV',
  CMP   = 'CMP',
  PUSH  = 'PUSH',
  POP   = 'POP',
  PUSHF = 'PUSHF',
  POPF  = 'POPF',
  CALL  = 'CALL',
  RET   = 'RET',
  INT   = 'INT',
  IRET  = 'IRET',
  IN    = 'IN',
  OUT   = 'OUT',
  HALT  = 'HALT',
  STI   = 'STI',
  CLI   = 'CLI',
  CLO   = 'CLO',
  NOP   = 'NOP',
}

export enum DirectiveName {
  END = 'END',
  ORG = 'ORG',
  DB  = 'DB',
}

export enum RegisterName {
  AL = 'AL',
  BL = 'BL',
  CL = 'CL',
  DL = 'DL',
}
