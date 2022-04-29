; --------------------------------------
;	Seven-segment Display
; --------------------------------------
	JMP Start		; Jump past the data table
	DB  FA			; 0 - 1111 1010
	DB  60			; 1 - 0110 0000
	DB  B6			; 2 - 1011 0110
	DB  9E			; 3 - 1001 1110
	DB  4E			; 4 - 0100 1110
	DB  DC			; 5 - 1101 1100
	DB  FC			; 6 - 1111 1100
	DB  8A			; 7 - 1000 1010
	DB  FE			; 8 - 1111 1110
	DB  DE			; 9 - 1101 1110
	DB  00
Start:
	MOV BL,  02		; Make BL point to the first entry in the data table
	MOV AL, [BL]	; Copy data from table to AL
Loop:
	OUT 02			; Send data to seven-segment display
	INC AL			; Set the right most bit to one
	NOP NOP NOP		; Wait for three cycles
	OUT 02			; Send data to seven-segment display
	INC BL			; Make BL point to the next entry in the data table
	MOV AL, [BL]	; Copy data from table to AL
	CMP AL,  00		; Check if the next entry exists
	JNZ Loop
	JMP Start
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
