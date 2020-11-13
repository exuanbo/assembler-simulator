import { Statement, parseStatement, parseLables } from '../src/utils/tokenize'

const code = `
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

const statements: Statement[] = [
  { key: 'MOV', args: ['dl', 'A'] },
  { key: 'MOV', args: ['al', '0'] },
  { key: 'MOV', args: ['bl', 'C0'] },

  { key: 'loop', args: undefined },
  { key: 'ADD', args: ['al', '30'] },
  { key: 'MOV', args: ['[bl]', 'al'] },
  { key: 'SUB', args: ['al', '30'] },
  { key: 'INC', args: ['al'] },
  { key: 'INC', args: ['bl'] },
  { key: 'CMP', args: ['al', 'dl'] },
  { key: 'JZ', args: ['fin'] },
  { key: 'JMP', args: ['loop'] },

  { key: 'fin', args: undefined },
  { key: 'END', args: null }
]

const labels: Array<[string, number]> = [
  ['loop', 3],
  ['fin', 12]
]

it('should parse code to return statements', () => {
  const res = parseStatement(code)
  expect(res).toEqual(statements)
})

it('should parse statements to return lables', () => {
  const res = parseLables(statements)
  expect(res).toEqual(labels)
})
