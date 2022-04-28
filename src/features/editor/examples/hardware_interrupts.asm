; --------------------------------------
;	Hardware Interrupts
; --------------------------------------
	JMP	 Start		; Jump past the table of interrupt vectors
	DB   50			; Vector at 02 pointing to address 50
Start:
	STI				; Set I flag. Enable hardware interrupts
	MOV	 AL,  30	; ASCII for '0'
Loop:
	MOV [C0], AL	; Copy the data in AL to the video RAM
	INC	 AL			; Add one to AL
	JMP	Loop
; --------------------------------------
	ORG	 50
	MOV  AL,  30	; Reset AL to ASCII for '0'
	IRET
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
