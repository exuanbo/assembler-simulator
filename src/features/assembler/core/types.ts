import type { Mnemonic } from '@/common/constants'

export interface SourceRange {
  from: number
  to: number
}

export type MnemonicWithOneOperand =
  | Mnemonic.INC
  | Mnemonic.DEC
  | Mnemonic.NOT
  | Mnemonic.ROL
  | Mnemonic.ROR
  | Mnemonic.SHL
  | Mnemonic.SHR
  | Mnemonic.JMP
  | Mnemonic.JZ
  | Mnemonic.JNZ
  | Mnemonic.JS
  | Mnemonic.JNS
  | Mnemonic.JO
  | Mnemonic.JNO
  | Mnemonic.PUSH
  | Mnemonic.POP
  | Mnemonic.CALL
  | Mnemonic.INT
  | Mnemonic.IN
  | Mnemonic.OUT
  | Mnemonic.ORG
  | Mnemonic.DB

export type MnemonicWithTwoOperands =
  | Mnemonic.ADD
  | Mnemonic.SUB
  | Mnemonic.MUL
  | Mnemonic.DIV
  | Mnemonic.MOD
  | Mnemonic.AND
  | Mnemonic.OR
  | Mnemonic.XOR
  | Mnemonic.MOV
  | Mnemonic.CMP
