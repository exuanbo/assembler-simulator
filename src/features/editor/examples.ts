interface Example {
  title: string
  content: string
}

export const examples: readonly Example[] = [
  {
    title: 'Visual Display Unit',
    content: `; --------------------------------
;  Example / Visual Display Unit
; --------------------------------

jmp start

db "Hello World!"
db 00

start:
	mov al, c0
	mov bl, 02
	mov cl, [bl]

loop:
	mov [al], cl
	inc al
	inc bl
	mov cl, [bl]
	cmp cl, 00
	jnz loop

end
`
  },
  {
    title: 'Traffic Lights',
    content: `; ---------------------------
;  Example / Traffic Lights
; ---------------------------

start:
	mov al, 80	; 1000 0000

loop:
	out 01
	div al, 02
	cmp al, 00
	jnz loop
	jmp start

end
`
  },
  {
    title: 'Seven-Segment Display',
    content: `; ----------------------------------
;  Example / Seven-Segment Display
; ----------------------------------

jmp start

db fa	; 1111 1010
db 60	; 0110 0000
db b6	; 1011 0110
db 9e	; 1001 1110
db 4e	; 0100 1110
db dc	; 1101 1100
db fc	; 1111 1100
db 8a	; 1000 1010
db fe	; 1111 1110
db de	; 1101 1110
db 00

start:
	mov bl, 02
	mov al, [bl]

loop:
	out 02
	inc al
	nop nop nop
	out 02
	inc bl
	mov al, [bl]
	cmp al, 00
	jnz loop
	jmp start

end
`
  }
]
