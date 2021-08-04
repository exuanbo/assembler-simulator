import { tokenize } from './tokenizer'
import type { Statement } from './parser'
import { OperandType, parse } from './parser'
import {
  DuplicateLabelError,
  EndOfMemoryError,
  LabelNotExistError,
  JumpDistanceError
} from '../exceptions'
import { Mnemonic } from '../constants'

export * from './tokenizer'
export * from './parser'

type LabelToAddressMap = Map<string, number>

const getLabelToAddressMap = (statements: Statement[]): LabelToAddressMap => {
  const labelToAddressMap: LabelToAddressMap = new Map()
  statements.reduce((address, statement) => {
    const { label, instruction, operands, machineCodes } = statement
    if (label !== null) {
      if (labelToAddressMap.has(label.identifier)) {
        throw new DuplicateLabelError(label)
      }
      labelToAddressMap.set(label.identifier, address)
    }
    const firstOperand = operands[0]
    if (instruction.mnemonic === Mnemonic.ORG) {
      return firstOperand.value as number
    }
    const nextAddress =
      address +
      machineCodes.length +
      (firstOperand !== undefined && firstOperand.type === OperandType.Label ? 1 : 0)
    if (nextAddress > 0xff) {
      throw new EndOfMemoryError(statement)
    }
    return nextAddress
  }, 0)
  return labelToAddressMap
}

type AddressToMachineCodeMap = Map<number, number>
type AddressToStatementMap = Map<number, Statement>

type AssembleResult = [AddressToMachineCodeMap, AddressToStatementMap]

export const assemble = (input: string): AssembleResult => {
  const addressToMachineCodeMap: AddressToMachineCodeMap = new Map()
  const addressToStatementMap: AddressToStatementMap = new Map()
  const statements = parse(tokenize(input))
  const labelToAddressMap = getLabelToAddressMap(statements)
  statements.reduce((address, statement) => {
    const { instruction, operands, machineCodes } = statement
    const firstOperand = operands[0]
    if (instruction.mnemonic === Mnemonic.ORG) {
      return firstOperand.value as number
    }
    if (firstOperand !== undefined && firstOperand.type === OperandType.Label) {
      const labelAddress = labelToAddressMap.get(firstOperand.token.value)
      if (labelAddress === undefined) {
        throw new LabelNotExistError(firstOperand.token)
      }
      const distance = labelAddress - address
      if (distance < -128 || distance > 127) {
        throw new JumpDistanceError(firstOperand.token)
      }
      const unsignedDistance = distance < 0 ? 0x100 + distance : distance
      machineCodes.push(unsignedDistance)
    }
    machineCodes.forEach((machineCode, index) => {
      addressToMachineCodeMap.set(address + index, machineCode)
    })
    addressToStatementMap.set(address, statement)
    return address + machineCodes.length
  }, 0)
  return [addressToMachineCodeMap, addressToStatementMap]
}
