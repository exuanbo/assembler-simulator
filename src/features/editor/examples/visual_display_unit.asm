; --------------------------------------
;	Visual Display Unit
; --------------------------------------
	JMP Start		; Jump past the data table
	DB  "Hello World!"
	DB   00
Start:
	MOV  AL,  C0	; Make AL point to video RAM
	MOV  BL,  02	; Make BL point to the first character in the string
	MOV  CL, [BL]	; Copy the data from RAM into CL
Loop:
	MOV [AL], CL	; Copy the data in CL to the video RAM that AL points to
	INC  AL			; Make AL point to the next video RAM location
	INC  BL			; Make BL point to the next character in the string
	MOV  CL, [BL]	; Copy the data from RAM into CL
	CMP  CL,  00	; Check if the next character exists
	JNZ Loop
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
