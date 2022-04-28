; --------------------------------------
;	Keyboard Input
; --------------------------------------
	MOV  BL, C0		; Make BL point to video RAM
Loop:
	IN   00			; Wait for keyboard input
	CMP  AL, 0D		; Check if the key was Enter (Carriage Return)
	JZ  Done
	MOV [BL], AL	; Copy the data in AL to the video RAM that BL points to
	INC  BL			; Make BL point to the next video RAM location
	JNZ Loop
Done:
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
