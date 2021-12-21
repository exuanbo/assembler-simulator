import { memorySerializer } from '../../snapshotSerializers'
import { assemble } from '../../../src/features/assembler/core'
import { initDataFrom } from '../../../src/features/memory/core'

expect.addSnapshotSerializer(memorySerializer)

const SAMPLE_INPUT = `
; --------------------------------------------------------------
; An example of using hardware interrupts.
; This program spins the stepper motor continuously and
; steps the traffic lights on each hardware interrupt.

; Uncheck the "Show only one peripheral at a time" box
; to enable both displays to appear simultaneously.

; --------------------------------------------------------------
	JMP	Start	; Jump past table of interrupt vectors
	DB	50	; Vector at 02 pointing to address 50

Start:
	STI		; Set I flag. Enable hardware interrupts
	MOV	AL, 11	;
Rep:
	OUT	05	; Stepper motor
	ROR	AL	; Rotate bits in AL right
	JMP	Rep
	JMP	Start
; --------------------------------------------------------------
	ORG	50

	PUSH	al	; Save AL onto the stack.
	PUSH	bl	; Save BL onto the stack.
	PUSHF		; Save flags onto the stack.

	JMP	PastData

	DB	84	; Red		Green
	DB	c8	; Red+Amber	Amber
	DB	30	; Green		Red
	DB	58	; Amber		Red+Amber
	DB	57	; Used to track progress through table
PastData:
	MOV	BL,[5B]	; BL now points to the data table
	MOV	AL,[BL]	; Data from table goes into AL
	OUT	01	; Send AL data to traffic lights
	CMP	AL,58	; Last entry in the table
	JZ	Reset	; If last entry then reset pointer

	INC	BL	; BL points to next table entry
	MOV	[5B],BL	; Save pointer in RAM
	JMP	Stop
Reset:
	MOV	BL,57	; Pointer to data table start address
	MOV	[5B],BL	; Save pointer into RAM location 54
Stop:
	POPF		; Restore flags to their previous value
	POP	bl	; Restore BL to its previous value
	POP	al	; Restore AL to its previous value

	IRET
; --------------------------------------------------------------

END
; --------------------------------------------------------------
`

describe('assembler', () => {
  it('should assemble correctly', () => {
    const [addressToMachineCodeMap] = assemble(SAMPLE_INPUT)
    expect(initDataFrom(addressToMachineCodeMap)).toMatchSnapshot()
  })

  it('should throw DuplicateLabelError', () => {
    expect(() => {
      assemble(`
start: inc al
start: dec bl
end
`)
    }).toThrowError("Duplicate label 'START'")
  })

  it('should throw EndOfMemoryError', () => {
    expect(() => {
      assemble(`
org ff
inc al
end
`)
    }).toThrowError('Can not generate code beyond the end of RAM')
  })

  it('should throw LabelNotExistError', () => {
    expect(() => {
      assemble('jmp start end')
    }).toThrowError("Label 'start' does not exist")
  })

  it('should throw JumpDistanceError', () => {
    expect(() => {
      assemble(`
start:
inc al
org fd
jmp start
end
`)
    }).toThrowError("Jump distance should be between -128 and 127, to label 'start'")
  })
})
