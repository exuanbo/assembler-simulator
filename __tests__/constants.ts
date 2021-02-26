import type {
  StatementWithLabels,
  Statement,
  Label
} from '../src/core/tokenize'
import { Instruction } from '../src/core/constants'

export const CODE = `
mov dl, A    ; Move A(hex) or 10 in decimal into dl, to compare to al so we can break the loop when done
mov al, 0    ; Move 0 into al, al is going to be the counter
mov bl, C0   ; Move C0 into bl, bl is going to hold the memory address that we will be writing to

loop:        ; This is the label for the loop, and is where the program will jump back to while al < A
add al, 30   ; Adding 30 to al in order to convert it to an ASCII character that we can print. The numbers 0-9 change to 30-39 in ASCII.
mov [bl], al ; Move the character into the memory address held in bl. The first time around it will be C0, which is the first memory location in the VDU, after which bl will increase to C1, C2... as needed
sub al, 30   ; Remove 30 from al to change it back to a number
inc al       ; Increment al by 1 to the next number to be printed
inc bl       ; Increment bl by 1 to the next memory location
cmp al, dl   ; Check if al is equal to A
jz fin       ; If it is equal to A, then the program will jump to fin and end the program
jmp loop     ; Otherwise jump back to the 'loop' label

fin:         ; A label we can jump to when the loop is done
END          ; End of the program
`

export const STATEMENTS: StatementWithLabels[] = [
  { instruction: 'MOV', operands: ['DL', 'A'] },
  { instruction: 'MOV', operands: ['AL', '0'] },
  { instruction: 'MOV', operands: ['BL', 'C0'] },

  { instruction: 'LOOP:', operands: null },
  { instruction: 'ADD', operands: ['AL', '30'] },
  { instruction: 'MOV', operands: ['[BL]', 'AL'] },
  { instruction: 'SUB', operands: ['AL', '30'] },
  { instruction: 'INC', operands: ['AL'] },
  { instruction: 'INC', operands: ['BL'] },
  { instruction: 'CMP', operands: ['AL', 'DL'] },
  { instruction: 'JZ', operands: ['FIN'] },
  { instruction: 'JMP', operands: ['LOOP'] },

  { instruction: 'FIN:', operands: null },
  { instruction: 'END', operands: null }
]

export const STATEMENTS_WITH_LABEL_PARSED: Statement[] = [
  { instruction: Instruction.MOV, operands: ['DL', 'A'] },
  { instruction: Instruction.MOV, operands: ['AL', '0'] },
  { instruction: Instruction.MOV, operands: ['BL', 'C0'] },
  // LOOP
  { instruction: Instruction.ADD, operands: ['AL', '30'] },
  { instruction: Instruction.MOV, operands: ['[BL]', 'AL'] },
  { instruction: Instruction.SUB, operands: ['AL', '30'] },
  { instruction: Instruction.INC, operands: ['AL'] },
  { instruction: Instruction.INC, operands: ['BL'] },
  { instruction: Instruction.CMP, operands: ['AL', 'DL'] },
  { instruction: Instruction.JZ, operands: ['FIN'] },
  { instruction: Instruction.JMP, operands: ['LOOP'] },
  // FIN
  { instruction: Instruction.END, operands: null }
]

export const STATEMENTS_WITH_LABEL_VALUE: Statement[] = [
  { instruction: Instruction.MOV, operands: ['DL', 'A'] },
  { instruction: Instruction.MOV, operands: ['AL', '0'] },
  { instruction: Instruction.MOV, operands: ['BL', 'C0'] },
  // LOOP
  { instruction: Instruction.ADD, operands: ['AL', '30'] },
  { instruction: Instruction.MOV, operands: ['[BL]', 'AL'] },
  { instruction: Instruction.SUB, operands: ['AL', '30'] },
  { instruction: Instruction.INC, operands: ['AL'] },
  { instruction: Instruction.INC, operands: ['BL'] },
  { instruction: Instruction.CMP, operands: ['AL', 'DL'] },
  { instruction: Instruction.JZ, operands: ['04'] },
  { instruction: Instruction.JMP, operands: ['EE'] },
  // FIN
  { instruction: Instruction.END, operands: null }
]

export const STATEMENTS_OPCODES = [
  [0xd0, 0x03, 0x0a],
  [0xd0, 0x00, 0x00],
  [0xd0, 0x01, 0xc0],
  [0xb0, 0x00, 0x30],
  [0xd4, 0x01, 0x00],
  [0xb1, 0x00, 0x30],
  [0xa4, 0x00],
  [0xa4, 0x01],
  [0xda, 0x00, 0x03],
  [0xc1, 0x04],
  [0xc0, 0xee],
  [0x00]
]

export const STATEMENTS_WITH_ILLEGAL_OPERANDS: Statement[] = [
  { instruction: Instruction.MOV, operands: ['ALL', 'BL'] },
  { instruction: Instruction.ADD, operands: ['AL', 'BLL'] },
  { instruction: Instruction.INC, operands: ['ABC'] }
]

export const LABELS: Label[] = [
  { name: 'LOOP', address: 9 },
  { name: 'FIN', address: 29 }
]
