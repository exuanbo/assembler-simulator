import { tokenize } from './tokenizer'
import { OperandType, Statement, parse } from './parser'
import {
  DuplicateLabelError,
  AssembleEndOfMemoryError,
  LabelNotExistError,
  JumpDistanceError
} from '../../../common/exceptions'
import { Mnemonic } from '../../../common/constants'
import { call } from '../../../common/utils'

export * from './types'
export * from './tokenizer'
export * from './parser'

type LabelToAddressMap = Record<string, number>

const getLabelToAddressMap = (statements: Statement[]): LabelToAddressMap => {
  const [, labelToAddressMap] = statements.reduce<[number, LabelToAddressMap]>(
    ([address, labelToAddressMap], statement, index) => {
      const { label, instruction, operands, machineCodes } = statement
      if (label !== null) {
        if (labelToAddressMap[label.identifier] !== undefined) {
          throw new DuplicateLabelError(label)
        }
        labelToAddressMap[label.identifier] = address
      }
      const firstOperand = operands[0]
      return [
        instruction.mnemonic === Mnemonic.ORG
          ? (firstOperand.value as number)
          : call((): number => {
              const nextAddress =
                address +
                machineCodes.length +
                (firstOperand !== undefined && firstOperand.type === OperandType.Label ? 1 : 0)
              if (nextAddress > 0xff && index !== statements.length - 1) {
                throw new AssembleEndOfMemoryError(statement)
              }
              return nextAddress
            }),
        labelToAddressMap
      ]
    },
    [0, {}]
  )
  return labelToAddressMap
}

export type AddressToMachineCodeMap = Record<number, number>
export type AddressToStatementMap = Record<number, Statement>

type AssembleResult = [AddressToMachineCodeMap, AddressToStatementMap]

export const assemble = (input: string): AssembleResult => {
  const statements = parse(tokenize(input))
  const labelToAddressMap = getLabelToAddressMap(statements)
  const [, addressToMachineCodeMap, addressToStatementMap] = statements.reduce<
    [number, ...AssembleResult]
  >(
    ([address, addressToMachineCodeMap, addressToStatementMap], statement) => {
      const { instruction, operands, machineCodes } = statement
      const firstOperand = operands[0]
      if (instruction.mnemonic === Mnemonic.ORG) {
        return [firstOperand.value as number, addressToMachineCodeMap, addressToStatementMap]
      }
      if (firstOperand !== undefined && firstOperand.type === OperandType.Label) {
        const labelAddress = labelToAddressMap[firstOperand.rawValue]
        if (labelAddress === undefined) {
          throw new LabelNotExistError(firstOperand)
        }
        const distance = labelAddress - address
        if (distance < -128 || distance > 127) {
          throw new JumpDistanceError(firstOperand)
        }
        const unsignedDistance = distance < 0 ? 0x100 + distance : distance
        machineCodes.push(unsignedDistance)
      }
      const nextAddress = address + machineCodes.length
      machineCodes.forEach((machineCode, index) => {
        addressToMachineCodeMap[address + index] = machineCode
      })
      addressToStatementMap[address] = statement
      return [nextAddress, addressToMachineCodeMap, addressToStatementMap]
    },
    [0, {}, {}]
  )
  return [addressToMachineCodeMap, addressToStatementMap]
}
