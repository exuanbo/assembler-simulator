import { StatementWithLabels, Statement } from '../src/core/tokenize'
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
  { instruction: 'MOV', args: ['DL', 'A'] },
  { instruction: 'MOV', args: ['AL', '0'] },
  { instruction: 'MOV', args: ['BL', 'C0'] },

  { instruction: 'LOOP:', args: undefined },
  { instruction: 'ADD', args: ['AL', '30'] },
  { instruction: 'MOV', args: ['[BL]', 'AL'] },
  { instruction: 'SUB', args: ['AL', '30'] },
  { instruction: 'INC', args: ['AL'] },
  { instruction: 'INC', args: ['BL'] },
  { instruction: 'CMP', args: ['AL', 'DL'] },
  { instruction: 'JZ', args: ['FIN'] },
  { instruction: 'JMP', args: ['LOOP'] },

  { instruction: 'FIN:', args: undefined },
  { instruction: 'END', args: undefined }
]

export const STATEMENTS_WITH_LABEL_PARSED: Statement[] = [
  { instruction: Instruction.MOV, args: ['DL', 'A'] },
  { instruction: Instruction.MOV, args: ['AL', '0'] },
  { instruction: Instruction.MOV, args: ['BL', 'C0'] },
  // LOOP
  { instruction: Instruction.ADD, args: ['AL', '30'] },
  { instruction: Instruction.MOV, args: ['[BL]', 'AL'] },
  { instruction: Instruction.SUB, args: ['AL', '30'] },
  { instruction: Instruction.INC, args: ['AL'] },
  { instruction: Instruction.INC, args: ['BL'] },
  { instruction: Instruction.CMP, args: ['AL', 'DL'] },
  { instruction: Instruction.JZ, args: ['FIN'] },
  { instruction: Instruction.JMP, args: ['LOOP'] },
  // FIN
  { instruction: Instruction.END, args: undefined }
]

export const STATEMENTS_WITH_LABEL_VALUE_CALCULATED: Statement[] = [
  { instruction: Instruction.MOV, args: ['DL', 'A'] },
  { instruction: Instruction.MOV, args: ['AL', '0'] },
  { instruction: Instruction.MOV, args: ['BL', 'C0'] },
  // LOOP
  { instruction: Instruction.ADD, args: ['AL', '30'] },
  { instruction: Instruction.MOV, args: ['[BL]', 'AL'] },
  { instruction: Instruction.SUB, args: ['AL', '30'] },
  { instruction: Instruction.INC, args: ['AL'] },
  { instruction: Instruction.INC, args: ['BL'] },
  { instruction: Instruction.CMP, args: ['AL', 'DL'] },
  { instruction: Instruction.JZ, args: ['04'] },
  { instruction: Instruction.JMP, args: ['EE'] },
  // FIN
  { instruction: Instruction.END, args: undefined }
]

export const LABEL_TUPLES: Array<[string, number]> = [
  ['LOOP', 9],
  ['FIN', 29]
]
