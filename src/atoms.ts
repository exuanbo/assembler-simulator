import { atom } from 'precoil'
import { initMemory } from './core'

const DEFAULT_INPUT = `mov al, 5A
mov bl, D3

loop:
mov [bl], al
dec al
cmp al, 40
jz done
inc bl
jz reset
jmp loop

reset:
mov bl, c0
jmp loop

done:
end
`

export const codeState = atom(DEFAULT_INPUT)

export const memoryState = atom(initMemory())

export const errorState = atom<string | null>(null)
