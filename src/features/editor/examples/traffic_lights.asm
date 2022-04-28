; --------------------------------------
;	Traffic Lights
; --------------------------------------
	MOV AL, 80		; 1000 0000
Loop:
	OUT 01			; Send data to traffic lights
	ROR AL			; Rotate the bits in AL to the right
	JMP Loop
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
