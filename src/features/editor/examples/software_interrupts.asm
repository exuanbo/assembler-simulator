; --------------------------------------
;	Software Interrupts
; --------------------------------------
	JMP Start		; Jump past the table of interrupt vectors
	DB   51			; Vector at 02 pointing to address 51
	DB   71			; Vector at 03 pointing to address 71
Start:
	INT  02			; Do interrupt 02
	INT  03			; Do interrupt 03
	JMP Start
; --------------------------------------
	ORG  50
	DB   E0
					; Interrupt code starts here
	MOV  AL, [50]	; Copy bits from RAM into AL
	NOT  AL			; Invert the bits in AL
	MOV [50], AL	; Copy inverted bits back to RAM
	OUT  01			; Send data to traffic lights
	IRET
; --------------------------------------
	ORG  70
	DB   FE
					; Interrupt code starts here
	MOV  AL, [70]	; Copy bits from RAM into AL
	NOT  AL			; Invert the bits in AL
	AND  AL,  FE	; Set the right most bit to zero
	MOV [70], AL	; Copy inverted bits back to RAM
	OUT  02			; Send data to seven-segment display
	IRET
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
