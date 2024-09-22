import { Mnemonic } from '@/common/constants'
import { invariant, unsign8 } from '@/common/utils'

import {
  AssembleEndOfMemoryError,
  DuplicateLabelError,
  JumpDistanceError,
  LabelNotExistError,
} from './exceptions'
import { type Operand, OperandType, parse, type Statement } from './parser'

export type { AssemblerErrorObject } from './exceptions'
export { AssemblerError } from './exceptions'
export type { Statement } from './parser'
export type { SourceRange } from './types'

interface LabelToAddressMap {
  [labelIdentifier: string]: number
}

const getLabelToAddressMap = (statements: Statement[]): LabelToAddressMap => {
  const labelToAddressMap: LabelToAddressMap = {}
  const statementCount = statements.length
  for (let address = 0, statementIndex = 0; statementIndex < statementCount; statementIndex++) {
    const statement = statements[statementIndex]
    const { label, instruction, operands, codes } = statement
    if (label !== null) {
      if (label.identifier in labelToAddressMap) {
        throw new DuplicateLabelError(label)
      }
      labelToAddressMap[label.identifier] = address
    }
    const firstOperand = operands[0] as Operand | undefined
    if (instruction.mnemonic === Mnemonic.ORG) {
      invariant(typeof firstOperand?.code === 'number')
      address = firstOperand.code
    }
    else {
      // label value has not been calculated yet
      address += codes.length + (firstOperand?.type === OperandType.Label ? 1 : 0)
      if (address > 0xff && statementIndex !== statementCount - 1) {
        throw new AssembleEndOfMemoryError(statement)
      }
    }
  }
  return labelToAddressMap
}

export interface AddressToCodeMap {
  [address: number]: number
}

export interface AddressToStatementMap {
  [address: number]: Statement
}

export type AssembleResult = [AddressToCodeMap, Partial<AddressToStatementMap>]

export const assemble = (source: string): AssembleResult => {
  const statements = parse(source)
  const labelToAddressMap = getLabelToAddressMap(statements)
  const addressToCodeMap: AddressToCodeMap = {}
  const addressToStatementMap: AddressToStatementMap = {}
  const statementCount = statements.length
  for (let address = 0, statementIndex = 0; statementIndex < statementCount; statementIndex++) {
    const statement = statements[statementIndex]
    const { instruction, operands, codes } = statement
    const firstOperand = operands[0] as Operand | undefined
    if (instruction.mnemonic === Mnemonic.ORG) {
      invariant(typeof firstOperand?.code === 'number')
      address = firstOperand.code
      continue
    }
    if (firstOperand?.type === OperandType.Label) {
      if (!(firstOperand.value in labelToAddressMap)) {
        throw new LabelNotExistError(firstOperand)
      }
      const distance = labelToAddressMap[firstOperand.value] - address
      if (distance < -128 || distance > 127) {
        throw new JumpDistanceError(firstOperand)
      }
      const unsignedDistance = unsign8(distance)
      firstOperand.code = unsignedDistance
      codes.push(unsignedDistance)
    }
    const nextAddress = address + codes.length
    codes.forEach((code, codeIndex) => {
      addressToCodeMap[address + codeIndex] = code
    })
    addressToStatementMap[address] = statement
    address = nextAddress
  }
  return [addressToCodeMap, addressToStatementMap]
}
