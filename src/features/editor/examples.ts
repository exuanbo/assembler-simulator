const COMMENT_DIVIDER = '; --------------------------------------'

const applyTemplate = (title: string, body: string, footer = ''): string => `${COMMENT_DIVIDER}
;\t${title}
${COMMENT_DIVIDER}
${body}
${COMMENT_DIVIDER}
\tEND
${COMMENT_DIVIDER}
${footer}`

export const NEW_FILE_TEMPLATE = applyTemplate('New File', '\t')

const FOOTER_MESSAGE = 'For more examples, select File > Open Example.'

interface Example {
  title: string
  content: string
}

const createExample = (title: string, body: string): Example => {
  return {
    title,
    content: applyTemplate(title, body, `\n${FOOTER_MESSAGE}\n`)
  }
}

export const examples: readonly Example[] = [
  createExample(
    'Procedures',
    `\tMOV  AL, 08\t\t; Initialize AL to 08
Loop:
\tDIV  AL, 02\t\t; 04 - Green
\tOUT  01\t\t\t; Send data to traffic lights
\tMUL  AL, 04\t\t; 10 - Longer delay
\tCALL 30\t\t\t; Call procedure 30

\tDIV  AL, 02\t\t; 08 - Yellow
\tOUT  01\t\t\t; Send data to traffic lights
\tDIV  AL, 02\t\t; 04 - Short delay
\tCALL 30\t\t\t; Call procedure 30

\tMUL  AL, 04\t\t; 10 - Red
\tOUT  01\t\t\t; Send data to traffic lights
\tDIV  AL, 02\t\t; 08 - Middle sized delay
\tCALL 30\t\t\t; Call procedure 30
\tJMP  Loop
${COMMENT_DIVIDER}
\tORG  30
\tPUSH AL\t\t\t; Save AL to the stack
Rep:
\tDEC  AL\t\t\t; Subtract one from AL
\tJNZ  Rep
\tPOP  AL\t\t\t; Restore AL from the stack
\tRET\t\t\t\t; Return from the procedure`
  ),
  createExample(
    'Software Interrupts',
    `\tJMP Start\t\t; Jump past table of interrupt vectors
\tDB   51\t\t\t; Vector at 02 pointing to address 51
\tDB   71\t\t\t; Vector at 03 pointing to address 71
Start:
\tINT  02\t\t\t; Do interrupt 02
\tINT  03\t\t\t; Do interrupt 03
\tJMP Start
${COMMENT_DIVIDER}
\tORG  50
\tDB   E0
\t\t\t\t\t; Interrupt code starts here
\tMOV  AL, [50]\t; Copy bits from RAM into AL
\tNOT  AL\t\t\t; Invert the bits in AL
\tMOV [50], AL\t; Copy inverted bits back to RAM
\tOUT  01\t\t\t; Send data to traffic lights
\tIRET
${COMMENT_DIVIDER}
\tORG  70
\tDB   FE
\t\t\t\t\t; Interrupt code starts here
\tMOV  AL, [70]\t; Copy bits from RAM into AL
\tNOT  AL\t\t\t; Invert the bits in AL
\tAND  AL,  FE\t; Set the right most bit to zero
\tMOV [70], AL\t; Copy inverted bits back to RAM
\tOUT  02\t\t\t; Send data to seven-segment display
\tIRET`
  ),
  createExample('Hardware Interrupts', '\t'),
  createExample(
    'Keyboard Input',
    `\tMOV  BL, C0\t\t; Make BL point to video RAM
Loop:
\tIN   00\t\t\t; Wait for keyboard input
\tCMP  AL, 0D\t\t; Check if the key was Enter (Carriage Return)
\tJZ  Done
\tMOV [BL], AL\t; Copy the code in AL to the video RAM that BL points to
\tINC  BL\t\t\t; Make BL point to the next video RAM location
\tJNZ Loop
Done:`
  ),
  createExample(
    'Visual Display Unit',
    `\tJMP Start\t\t; Jump past the data table
\tDB  "Hello World!"
\tDB   00
Start:
\tMOV  AL,  C0\t; Make AL point to video RAM
\tMOV  BL,  02\t; Make BL point to the start address of the string
\tMOV  CL, [BL]\t; Copy the first character from RAM to CL
Loop:
\tMOV [AL], CL\t; Copy the code in CL to the video RAM that AL points to
\tINC  AL\t\t\t; Make AL point to the next video RAM location
\tINC  BL\t\t\t; Make BL point to the next character
\tMOV  CL, [BL]\t; Copy the next character from RAM to CL
\tCMP  CL,  00\t; Check if the next character is zero
\tJNZ Loop`
  ),
  createExample(
    'Traffic Lights',
    `\tMOV AL, 80\t\t; 1000 0000
Loop:
\tOUT 01\t\t\t; Send data to traffic lights
\tROR AL\t\t\t; Rotate the bits in AL to the right
\tJMP Loop`
  ),
  createExample(
    'Seven-Segment Display',
    `\tJMP Start\t\t; Jump past the data table
\tDB  FA\t\t\t; 0 - 1111 1010
\tDB  60\t\t\t; 1 - 0110 0000
\tDB  B6\t\t\t; 2 - 1011 0110
\tDB  9E\t\t\t; 3 - 1001 1110
\tDB  4E\t\t\t; 4 - 0100 1110
\tDB  DC\t\t\t; 5 - 1101 1100
\tDB  FC\t\t\t; 6 - 1111 1100
\tDB  8A\t\t\t; 7 - 1000 1010
\tDB  FE\t\t\t; 8 - 1111 1110
\tDB  DE\t\t\t; 9 - 1101 1110
\tDB  00
Start:
\tMOV BL,  02\t\t; Make BL point to the start address of the data table
\tMOV AL, [BL]\t; Copy the first number from RAM to AL
Loop:
\tOUT 02\t\t\t; Send data to seven-segment display
\tINC AL\t\t\t; Set the right most bit to one
\tNOP NOP NOP\t\t; Wait for three cycles
\tOUT 02\t\t\t; Send data to seven-segment display
\tINC BL\t\t\t; Make BL point to the next number in the data table
\tMOV AL, [BL]\t; Copy the next number from RAM to AL
\tCMP AL,  00\t\t; Check if the next number is zero
\tJNZ Loop\t\t
\tJMP Start`
  )
]
