import { tokenize } from './tokenizer'
import type { Statement } from './parser'
import { OperandType, parse } from './parser'
import { DuplicateLabelError, AssembleError, LabelNotExistError } from './exceptions'
import { Instruction } from '../constants'

const getLabelToAddressMap = (statements: Statement[]): Map<string, number> => {
  const [, labelAddressMap] = statements.reduce(
    ([addressPointer, labelAddressMap], { label, instruction, operands, opcodes }) => {
      if (label !== null) {
        if (labelAddressMap.has(label.identifier)) {
          throw new DuplicateLabelError(label)
        }
        labelAddressMap.set(label.identifier, addressPointer)
      }
      const firstOperand = operands[0]
      if (instruction === Instruction.ORG) {
        return [firstOperand.value as number, labelAddressMap]
      }
      const nextAddressPointer =
        addressPointer +
        opcodes.length +
        (firstOperand !== undefined && firstOperand.type === OperandType.Label ? 1 : 0)
      if (nextAddressPointer > 0xff) {
        throw new AssembleError()
      }
      return [nextAddressPointer, labelAddressMap]
    },
    [0, new Map<string, number>()]
  )
  return labelAddressMap
}

export const assemble = (input: string): [Uint8Array, Map<number, Statement>] => {
  const statements = parse(tokenize(input))
  const labelToAddressMap = getLabelToAddressMap(statements)
  const [, data, addressToStatementMap] = statements.reduce(
    ([addressPointer, data, addressToStatementMap], statement) => {
      const { instruction, operands, opcodes } = statement
      const firstOperand = operands[0]
      if (instruction === Instruction.ORG) {
        return [firstOperand.value as number, data, addressToStatementMap]
      }
      if (firstOperand !== undefined && firstOperand.type === OperandType.Label) {
        const labelAddress = labelToAddressMap.get(firstOperand.token.value)
        if (labelAddress === undefined) {
          throw new LabelNotExistError(firstOperand.token)
        }
        const distance = labelAddress - addressPointer
        const unsignedDistance = distance < 0 ? 0x100 + distance : distance
        opcodes.push(unsignedDistance)
      }
      data.set(opcodes, addressPointer)
      addressToStatementMap.set(addressPointer, statement)
      return [addressPointer + opcodes.length, data, addressToStatementMap]
    },
    [0, new Uint8Array(0x100), new Map<number, Statement>()]
  )
  return [data, addressToStatementMap]
}
