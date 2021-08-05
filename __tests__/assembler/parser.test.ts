import type { Statement } from '../../src/core/assembler'
import { tokenize, parse as _parse } from '../../src/core/assembler'
import { expectError } from '../utils'

const parse = (input: string): Statement[] => _parse(tokenize(input))

describe('parser', () => {
  it('should parse instruction with no operand', () => {
    expect(
      parse(`
pushf
popf
ret
iret
halt
nop
clo
cli
sti
end
`)
    ).toMatchSnapshot()
  })

  it('should parse instruction with 1 operand', () => {
    expect(
      parse(`
start:
inc al
dec bl
not cl
rol dl
ror al
shl bl
shr cl
jmp start
jz start
jnz start
js start
jns start
jo start
jno start
push al
pop bl
call 0
int 1
in 2
out 3
org 4
db 5
db "67"
end
`)
    ).toMatchSnapshot()
  })

  it('should parse direct arithmetic instruction', () => {
    expect(
      parse(`
add al, bl
sub cl, dl
mul al, bl
div cl, dl
mod al, bl
and cl, dl
or al, bl
xor cl, dl
end
`)
    ).toMatchSnapshot()
  })

  it('should parse immediate arithmetic instruction', () => {
    expect(
      parse(`
add al, 01
sub bl, 02
mul cl, 03
div dl, 04
mod al, 01
and bl, 02
or cl, 03
xor dl, 04
end
`)
    ).toMatchSnapshot()
  })

  it('should parse move instruction', () => {
    expect(
      parse(`
mov al, 01
mov bl, [02]
mov [03], cl
mov dl, [al]
mov [bl], cl
end
`)
    ).toMatchSnapshot()
  })

  it('should parse compare instruction', () => {
    expect(
      parse(`
cmp al, bl
cmp cl, 01
cmp dl, [02]
end
`)
    ).toMatchSnapshot()
  })

  it('should throw InvalidLabelError', () => {
    expectError(() => {
      parse('!done: end')
    }, 'Label should start with a charactor or underscore: !done')

    expectError(() => {
      parse(': end')
    }, 'Label should start with a charactor or underscore: ')

    expectError(() => {
      parse('jmp !start end')
    }, 'Label should start with a charactor or underscore: !start')
  })

  const tokensKnown = [',', '01', 'al', '[bl]', '"cl"']

  it('should throw StatementError without label', () => {
    tokensKnown.forEach(token => {
      expectError(() => {
        parse(`${token} end`)
      }, `Expected label or instruction: ${token}`)
    })
  })

  it('should throw StatementError with label', () => {
    tokensKnown.forEach(token => {
      expectError(() => {
        parse(`start: ${token} end`)
      }, `Expected instruction: ${token}`)
    })
  })

  const MISSING_END_ERROR_MSG = 'Expected END at the end of the source code'

  it('should throw MissingEndError when missing operand', () => {
    expectError(() => {
      parse('mov')
    }, MISSING_END_ERROR_MSG)
  })

  it('should throw MissingEndError when missing comma', () => {
    expectError(() => {
      parse('mov al')
    }, MISSING_END_ERROR_MSG)
  })

  it('should throw MissingEndError when missing instruction', () => {
    expectError(() => {
      parse('start:')
    }, MISSING_END_ERROR_MSG)
  })

  it('should throw MissingEndError when parsing is completed', () => {
    expectError(() => {
      parse('mov al, 01')
    }, MISSING_END_ERROR_MSG)
  })

  it('should throw AddressError when address is invalid', () => {
    expectError(() => {
      parse('mov [gg], al')
    }, 'Expected a number or register: gg')
  })

  it('should throw AddressError when address is empty', () => {
    expectError(() => {
      parse('mov [], al')
    }, 'Expected a number or register: ]')
  })

  it('should throw InvalidNumberError', () => {
    expectError(() => {
      parse('mov al, 100')
    }, 'Number should be hexadecimal and less than or equal to FF: 100')
  })

  it('should throw InvalidNumberError when parsing address', () => {
    expectError(() => {
      parse('mov [100], al')
    }, 'Number should be hexadecimal and less than or equal to FF: 100')
  })

  it('should throw InvalidNumberError when parsing non-digit number', () => {
    expectError(() => {
      parse('mov al, fff')
    }, 'Number should be hexadecimal and less than or equal to FF: fff')
  })

  it('should throw OperandTypeError with one expected type', () => {
    expectError(() => {
      parse('inc 01')
    }, 'Expected register: 01')
  })

  it('should throw OperandTypeError with more than one expected types', () => {
    expectError(() => {
      parse('mov 01')
    }, 'Expected register, address or register address: 01')
  })

  describe('move instruction', () => {
    it('should throw OperandTypeError when parsing second operand', () => {
      expectError(() => {
        parse('mov al, "bl"')
      }, 'Expected number, address or register address: "bl"')

      expectError(() => {
        parse('mov [al], "01"')
      }, 'Expected register: "01"')

      expectError(() => {
        parse('mov [01], "02"')
      }, 'Expected register: "02"')
    })

    it('should throw OperandTypeError when the types of the two operands are not allowed', () => {
      expectError(() => {
        parse('mov al, bl')
      }, 'Expected number, address or register address: bl')

      expectError(() => {
        parse('mov [01], 02')
      }, 'Expected register: 02')

      expectError(() => {
        parse('mov [al], 01')
      }, 'Expected register: 01')
    })
  })

  it('should throw MissingCommaError', () => {
    expectError(() => {
      parse('mov al 01')
    }, 'Expected comma: 01')
  })
})
