const COMMENT_DIVIDER = '; --------------------------------------'

const FOOTER_MESSAGE = 'For more examples, select File > Open Example.'

interface Example {
  title: string
  content: string
}

export const examples: readonly Example[] = [
  {
    title: 'Visual Display Unit',
    content: `${COMMENT_DIVIDER}
;\tVisual Display Unit
${COMMENT_DIVIDER}
\tJMP Start

\tDB "Hello World!"
\tDB 00

Start:
\tMOV AL, C0
\tMOV BL, 02
\tMOV CL, [BL]

Loop:
\tMOV [AL], CL
\tINC AL
\tINC BL
\tMOV CL, [BL]
\tCMP CL, 00
\tJNZ Loop
${COMMENT_DIVIDER}
\tEND
${COMMENT_DIVIDER}

${FOOTER_MESSAGE}
`
  },
  {
    title: 'Traffic Lights',
    content: `${COMMENT_DIVIDER}
;\tTraffic Lights
${COMMENT_DIVIDER}
Start:
\tMOV AL, 80\t; 1000 0000

Loop:
\tOUT 01
\tDIV AL, 02
\tCMP AL, 00
\tJNZ Loop
\tJMP Start
${COMMENT_DIVIDER}
\tEND
${COMMENT_DIVIDER}

${FOOTER_MESSAGE}
`
  },
  {
    title: 'Seven-Segment Display',
    content: `${COMMENT_DIVIDER}
;\tSeven-Segment Display
${COMMENT_DIVIDER}
\tJMP Start

\tDB FA\t; 1111 1010
\tDB 60\t; 0110 0000
\tDB B6\t; 1011 0110
\tDB 9E\t; 1001 1110
\tDB 4E\t; 0100 1110
\tDB DC\t; 1101 1100
\tDB FC\t; 1111 1100
\tDB 8A\t; 1000 1010
\tDB FE\t; 1111 1110
\tDB DE\t; 1101 1110
\tDB 00

Start:
\tMOV BL, 02
\tMOV AL, [BL]

Loop:
\tOUT 02
\tINC AL
\tNOP NOP NOP
\tOUT 02
\tINC BL
\tMOV AL, [BL]
\tCMP AL, 00
\tJNZ Loop
\tJMP Start
${COMMENT_DIVIDER}
\tEND
${COMMENT_DIVIDER}

${FOOTER_MESSAGE}
`
  }
]
