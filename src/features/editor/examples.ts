interface Example {
  readonly title: string
  readonly content: string
}

export const examples: readonly Example[] = [
  {
    title: 'Hello World',
    content: `jmp start

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
    content: `start:
	mov al, 80

loop:
	out 01
	div al, 02
	cmp al, 00
	jnz loop
	jmp start

end
`
  }
]
