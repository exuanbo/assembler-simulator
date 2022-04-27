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
    `\tMOV  AL, 10\t; Initialize AL

Loop:
\tDIV  AL, 02\t; 08 - Yellow
\tOUT  01\t\t; Output to Traffic Light
\tDIV  AL, 02\t; 04 - Short delay
\tCALL 30\t\t; Call the procedure at address [30]

\tMUL  AL, 04\t; 10 - Red
\tOUT  01\t\t; Output to Traffic Light
\tDIV  AL, 02\t; 08 - Middle sized delay
\tCALL 30\t\t; Call the procedure at address [30]

\tDIV  AL, 02\t; 04 - Green
\tOUT  01\t\t; Output to Traffic Light
\tMUL  AL, 04\t; 10 - Longer delay
\tCALL 30\t\t; Call the procedure at address [30]

\tJMP  Loop
${COMMENT_DIVIDER}
\tORG  30\t\t; Generate machine code from address [30]
\tPUSH AL\t\t; Save AL to the stack

Rep:
\tDEC  AL\t\t; Subtract one from AL
\tJNZ  Rep\t; Jump back to Rep if AL is not zero

\tPOP  AL\t\t; Restore AL from the stack
\tRET\t\t\t; Return from the procedure`
  ),
  createExample(
    'Keyboard Input',
    `\tMOV BL, C0\t\t; Start address of VDU

Loop:
\tIN  00\t\t\t; Wait for keyboard input
\tCMP AL, 0D\t\t; Check if the key was Enter (Carriage Return)
\tJZ  Done\t\t; Yes => Jump to Done

\tMOV [BL], AL\t; Output to VDU
\tINC BL\t\t\t; Increase the address of VDU by one
\tJNZ Loop\t\t; Jump back if there is still an available address

Done:`
  ),
  createExample(
    'Visual Display Unit',
    `\tJMP Start

\tDB "Hello World!"
\tDB 00

Start:
\tMOV AL, C0\t\t; Start address of VDU
\tMOV BL, 02\t\t; Address of the first character in the string
\tMOV CL, [BL]\t; Store the first character in CL

Loop:
\tMOV [AL], CL\t; Output to VDU
\tINC AL\t\t\t; Increase the address of VDU by one
\tINC BL\t\t\t; Increase the address of character by one
\tMOV CL, [BL]\t; Store the next character in CL
\tCMP CL, 00\t\t; Check if the next character is zero (NULL)
\tJNZ Loop\t\t; NO => Jump back to Loop`
  ),
  createExample(
    'Traffic Lights',
    `Start:
\tMOV AL, 80\t; 1000 0000

Loop:
\tOUT 01\t\t; Output to Traffic Lights
\tDIV AL, 02\t; Move the bit to right by one
\tCMP AL, 00\t; Check if AL is zero
\tJNZ Loop\t; No => Jump back to Loop
\tJMP Start`
  ),
  createExample(
    'Seven-Segment Display',
    `\tJMP Start

\tDB FA\t\t\t; 0 - 1111 1010
\tDB 60\t\t\t; 1 - 0110 0000
\tDB B6\t\t\t; 2 - 1011 0110
\tDB 9E\t\t\t; 3 - 1001 1110
\tDB 4E\t\t\t; 4 - 0100 1110
\tDB DC\t\t\t; 5 - 1101 1100
\tDB FC\t\t\t; 6 - 1111 1100
\tDB 8A\t\t\t; 7 - 1000 1010
\tDB FE\t\t\t; 8 - 1111 1110
\tDB DE\t\t\t; 9 - 1101 1110
\tDB 00

Start:
\tMOV BL, 02\t\t; Start address of the data table
\tMOV AL, [BL]\t; Store the first number in AL

Loop:
\tOUT 02\t\t\t; Output to Seven-segment Display
\tINC AL\t\t\t; Set LSB of the number to one
\tNOP NOP NOP\t\t; Wait for three cycles
\tOUT 02\t\t\t; Output to Seven-segment Display
\tINC BL\t\t\t; Increase the address of the data table by one
\tMOV AL, [BL]\t; Store the next number in AL
\tCMP AL, 00\t\t; Check if the next number is zero (NULL)
\tJNZ Loop\t\t; No => Jump back to Loop
\tJMP Start`
  )
]
