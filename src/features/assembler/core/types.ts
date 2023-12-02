import type { Mnemonic, MnemonicToOperandCountMap } from '@/common/constants'

export interface SourceRange {
  from: number
  to: number
}

type MnemonicWithOperandCount<
  C extends (typeof MnemonicToOperandCountMap)[Mnemonic],
  M extends Mnemonic = Mnemonic,
> = M extends never ? never : (typeof MnemonicToOperandCountMap)[M] extends C ? M : never

export type MnemonicWithNoOperand = MnemonicWithOperandCount<0>

export type MnemonicWithOneOperand = MnemonicWithOperandCount<1>

export type MnemonicWithTwoOperands = MnemonicWithOperandCount<2>
