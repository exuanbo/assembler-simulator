import { tokenize } from './tokenizer'
import type { Statement } from './parser'
import { OperandType, parse } from './parser'
import {
  DuplicateLabelError,
  EndOfMemoryError,
  LabelNotExistError,
  JumpDistanceError
} from './exceptions'
import { Mnemonic } from '../constants'

const getLabelToAddressMap = (statements: Statement[]): Map<string, number> => {
  const [, labelToAddressMap] = statements.reduce(
    ([address, labelToAddressMap], statement) => {
      const { label, instruction, operands, machineCodes } = statement
      if (label !== null) {
        if (labelToAddressMap.has(label.identifier)) {
          throw new DuplicateLabelError(label)
        }
        labelToAddressMap.set(label.identifier, address)
      }
      const firstOperand = operands[0]
      if (instruction.mnemonic === Mnemonic.ORG) {
        return [firstOperand.value as number, labelToAddressMap]
      }
      const nextAddress =
        address +
        machineCodes.length +
        (firstOperand !== undefined && firstOperand.type === OperandType.Label ? 1 : 0)
      if (nextAddress > 0xff) {
        throw new EndOfMemoryError(statement)
      }
      return [nextAddress, labelToAddressMap]
    },
    [0, new Map<string, number>()]
  )
  return labelToAddressMap
}

export const assemble = (input: string): [Map<number, number>, Map<number, Statement>] => {
  const statements = parse(tokenize(input))
  const labelToAddressMap = getLabelToAddressMap(statements)
  const [, addressToMachineCodeMap, addressToStatementMap] = statements.reduce(
    ([address, addressToMachineCodeMap, addressToStatementMap], statement) => {
      const { instruction, operands, machineCodes } = statement
      const firstOperand = operands[0]
      if (instruction.mnemonic === Mnemonic.ORG) {
        return [firstOperand.value as number, addressToMachineCodeMap, addressToStatementMap]
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
      return [address + machineCodes.length, addressToMachineCodeMap, addressToStatementMap]
    },
    [0, new Map<number, number>(), new Map<number, Statement>()]
  )
  return [addressToMachineCodeMap, addressToStatementMap]
}
