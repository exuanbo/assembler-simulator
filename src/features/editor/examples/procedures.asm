; --------------------------------------
;	Procedures
; --------------------------------------
	MOV  AL, E0		; 1110 0000
Loop:
	NOT  AL			; Invert the bits in AL
	OUT  01			; Send data to traffic lights
	MOV  BL, 01		; Short delay
	CALL 30			; Call procedure 30

	NOT  AL			; Invert the bits in AL
	OUT  01			; Send data to traffic lights
	MOV  BL, 04		; Middle sized delay
	CALL 30			; Call procedure 30

	NOT  AL			; Invert the bits in AL
	OUT  01			; Send data to traffic lights
	MOV  BL, 08		; Longer delay
	CALL 30			; Call procedure 30
	JMP  Loop
; --------------------------------------
	ORG  30
Rep:
	DEC  BL			; Subtract one from BL
	JNZ  Rep
	RET
; --------------------------------------
	END
; --------------------------------------

For more examples, select File > Open Example.
