import { Mnemonic } from '@/common/constants'
import { unsign8 } from '@/common/utils'

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
    const { label, instruction, operands, machineCodes } = statement
    if (label !== null) {
      if (label.identifier in labelToAddressMap) {
        throw new DuplicateLabelError(label)
      }
      labelToAddressMap[label.identifier] = address
    }
    const firstOperand = operands[0] as Operand | undefined
    if (instruction.mnemonic === Mnemonic.ORG) {
      address = firstOperand!.value as number
    } else {
      // label value has not been calculated yet
      address += machineCodes.length + (firstOperand?.type === OperandType.Label ? 1 : 0)
      if (address > 0xff && statementIndex !== statementCount - 1) {
        throw new AssembleEndOfMemoryError(statement)
      }
    }
  }
  return labelToAddressMap
}

export interface AddressToMachineCodeMap {
  [address: number]: number
}

export interface AddressToStatementMap {
  [address: number]: Statement
}

export type AssembleResult = [AddressToMachineCodeMap, Partial<AddressToStatementMap>]

export const assemble = (input: string): AssembleResult => {
  const statements = parse(input)
  const labelToAddressMap = getLabelToAddressMap(statements)
  const addressToMachineCodeMap: AddressToMachineCodeMap = {}
  const addressToStatementMap: AddressToStatementMap = {}
  const statementCount = statements.length
  for (let address = 0, statementIndex = 0; statementIndex < statementCount; statementIndex++) {
    const statement = statements[statementIndex]
    const { instruction, operands, machineCodes } = statement
    const firstOperand = operands[0] as Operand | undefined
    if (instruction.mnemonic === Mnemonic.ORG) {
      address = firstOperand!.value as number
      continue
    }
    if (firstOperand?.type === OperandType.Label) {
      if (!(firstOperand.rawValue in labelToAddressMap)) {
        throw new LabelNotExistError(firstOperand)
      }
      const distance = labelToAddressMap[firstOperand.rawValue] - address
      if (distance < -128 || distance > 127) {
        throw new JumpDistanceError(firstOperand)
      }
      const unsignedDistance = unsign8(distance)
      firstOperand.value = unsignedDistance
      machineCodes.push(unsignedDistance)
    }
    const nextAddress = address + machineCodes.length
    machineCodes.forEach((machineCode, machineCodeIndex) => {
      addressToMachineCodeMap[address + machineCodeIndex] = machineCode
    })
    addressToStatementMap[address] = statement
    address = nextAddress
  }
  return [addressToMachineCodeMap, addressToStatementMap]
}
