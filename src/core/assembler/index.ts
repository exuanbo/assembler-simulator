import { tokenize } from './tokenizer'
import type { Statement } from './parser'
import { OperandType, parse } from './parser'
import { DuplicateLabelError, AssembleError, LabelNotExistError } from './exceptions'
import { Instruction } from '../constants'

const getLabelToAddressMap = (statements: Statement[]): Map<string, number> => {
  const [, labelToAddressMap] = statements.reduce(
    ([address, labelToAddressMap], statement) => {
      const { label, instruction, operands, opcodes } = statement
      if (label !== null) {
        if (labelToAddressMap.has(label.identifier)) {
          throw new DuplicateLabelError(label)
        }
        labelToAddressMap.set(label.identifier, address)
      }
      const firstOperand = operands[0]
      if (instruction === Instruction.ORG) {
        return [firstOperand.value as number, labelToAddressMap]
      }
      const nextAddress =
        address +
        opcodes.length +
        (firstOperand !== undefined && firstOperand.type === OperandType.Label ? 1 : 0)
      if (nextAddress > 0xff) {
        throw new AssembleError(statement)
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
  const [, addressToOpcodeMap, addressToStatementMap] = statements.reduce(
    ([address, addressToOpcodeMap, addressToStatementMap], statement) => {
      const { instruction, operands, opcodes } = statement
      const firstOperand = operands[0]
      if (instruction === Instruction.ORG) {
        return [firstOperand.value as number, addressToOpcodeMap, addressToStatementMap]
      }
      if (firstOperand !== undefined && firstOperand.type === OperandType.Label) {
        const labelAddress = labelToAddressMap.get(firstOperand.token.value)
        if (labelAddress === undefined) {
          throw new LabelNotExistError(firstOperand.token)
        }
        const distance = labelAddress - address
        const unsignedDistance = distance < 0 ? 0x100 + distance : distance
        opcodes.push(unsignedDistance)
      }
      opcodes.forEach((opcode, index) => {
        addressToOpcodeMap.set(address + index, opcode)
      })
      addressToStatementMap.set(address, statement)
      return [address + opcodes.length, addressToOpcodeMap, addressToStatementMap]
    },
    [0, new Map<number, number>(), new Map<number, Statement>()]
  )
  return [addressToOpcodeMap, addressToStatementMap]
}
