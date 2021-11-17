import { tokenize } from './tokenizer'
import { OperandType, Operand, Statement, parse } from './parser'
import {
  DuplicateLabelError,
  AssembleEndOfMemoryError,
  LabelNotExistError,
  JumpDistanceError
} from './exceptions'
import { Mnemonic } from '../../../common/constants'
import { call } from '../../../common/utils'

type LabelToAddressMap = Record<string, number>

const getLabelToAddressMap = (statements: Statement[]): LabelToAddressMap => {
  const [, labelToAddressMap] = statements.reduce<[address: number, resultMap: LabelToAddressMap]>(
    ([address, labelToAddressMap], statement, index) => {
      const { label, instruction, operands, machineCode } = statement
      if (label !== null) {
        if (label.identifier in labelToAddressMap) {
          throw new DuplicateLabelError(label)
        }
        labelToAddressMap[label.identifier] = address
      }
      const firstOperand = operands[0] as Operand | undefined
      return [
        instruction.mnemonic === Mnemonic.ORG
          ? (firstOperand!.value as number)
          : call((): number => {
              const nextAddress =
                address + machineCode.length + (firstOperand?.type === OperandType.Label ? 1 : 0)
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
    [address: number, ...resultMaps: AssembleResult]
  >(
    ([address, addressToMachineCodeMap, addressToStatementMap], statement) => {
      const { instruction, operands, machineCode } = statement
      const firstOperand = operands[0] as Operand | undefined
      if (instruction.mnemonic === Mnemonic.ORG) {
        return [firstOperand!.value as number, addressToMachineCodeMap, addressToStatementMap]
      }
      if (firstOperand?.type === OperandType.Label) {
        if (!(firstOperand.rawValue in labelToAddressMap)) {
          throw new LabelNotExistError(firstOperand)
        }
        const distance = labelToAddressMap[firstOperand.rawValue] - address
        if (distance < -128 || distance > 127) {
          throw new JumpDistanceError(firstOperand)
        }
        const unsignedDistance = distance < 0 ? 0x100 + distance : distance
        firstOperand.value = unsignedDistance
        machineCode.push(unsignedDistance)
      }
      const nextAddress = address + machineCode.length
      machineCode.forEach((machineCode, index) => {
        addressToMachineCodeMap[address + index] = machineCode
      })
      addressToStatementMap[address] = statement
      return [nextAddress, addressToMachineCodeMap, addressToStatementMap]
    },
    [0, {}, {}]
  )
  return [addressToMachineCodeMap, addressToStatementMap]
}
