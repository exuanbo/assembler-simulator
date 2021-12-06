type Sample = Readonly<{
  title: string
  filename: string
  content: string
}>

export const samples: Sample[] = [
  {
    title: 'Hello World',
    filename: 'helloWorld.asm',
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
  }
]
