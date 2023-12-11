import { parse } from '@/features/assembler/core/parser'

import { shortArraySerializer } from '../../snapshotSerializers'

expect.addSnapshotSerializer(shortArraySerializer)

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
`),
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
`),
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
`),
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
`),
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
`),
    ).toMatchSnapshot()
  })

  it('should parse compare instruction', () => {
    expect(
      parse(`
cmp al, bl
cmp cl, 01
cmp dl, [02]
end
`),
    ).toMatchSnapshot()
  })

  it('should escape backslashes in ParserError message', () => {
    expect(() => {
      parse('db "\\"')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated string '\\"\\\\\\\\\\"'."`)
  })

  it('should escape single quotes in ParserError message', () => {
    expect(() => {
      parse('db "\'')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated string '\\"\\\\''."`)
  })

  it('should throw InvalidLabelError if label identifier is illegal', () => {
    expect(() => {
      parse('l0: end')
    }).toThrowErrorMatchingInlineSnapshot(
      `"Label should contain only letter or underscore, got 'l0'."`,
    )

    expect(() => {
      parse(': end')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected label or instruction, got ':'."`)

    expect(() => {
      parse('jmp l1 end')
    }).toThrowErrorMatchingInlineSnapshot(
      `"Label should contain only letter or underscore, got 'l1'."`,
    )
  })

  const TOKENS_KNOWN = [',', '01', 'al', '[bl]', '"cl"'] as const

  it('should throw StatementError if both label and instruction are missing', () => {
    TOKENS_KNOWN.forEach((token) => {
      expect(() => {
        parse(`${token} end`)
      }).toThrow(`Expected label or instruction, got '${token}'`)
    })
  })

  it('should throw StatementError if label exists but instruction is missing', () => {
    TOKENS_KNOWN.forEach((token) => {
      expect(() => {
        parse(`start: ${token} end`)
      }).toThrow(`Expected instruction, got '${token}'`)
    })
  })

  it('should throw MissingEndError if instruction is missing at the end', () => {
    expect(() => {
      parse('start:')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected END at the end of the source code."`)
  })

  it('should throw MissingEndError if the first operand is missing at the end', () => {
    expect(() => {
      parse('mov')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected END at the end of the source code."`)
  })

  it('should throw MissingEndError if the comma between two operands is missing at the end', () => {
    expect(() => {
      parse('mov al')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected END at the end of the source code."`)
  })

  it('should throw MissingEndError if the second operand is missing at the end', () => {
    expect(() => {
      parse('mov al,')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected END at the end of the source code."`)
  })

  it('should throw MissingEndError if END is missing at the end', () => {
    expect(() => {
      parse('mov al, 01')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected END at the end of the source code."`)
  })

  it('should throw InvalidNumberError', () => {
    expect(() => {
      parse('mov al, 100')
    }).toThrowErrorMatchingInlineSnapshot(`"Number '100' is greater than FF."`)
  })

  it('should throw InvalidNumberError when parsing address with number', () => {
    expect(() => {
      parse('mov [100], al')
    }).toThrowErrorMatchingInlineSnapshot(`"Number '100' is greater than FF."`)
  })

  it('should throw InvalidNumberError when parsing non-digit number', () => {
    expect(() => {
      parse('mov al, fff')
    }).toThrowErrorMatchingInlineSnapshot(`"Number 'fff' is greater than FF."`)
  })

  it('should throw InvalidStringError when parsing string with unsupported character', () => {
    expect(() => {
      parse('db "þÿĀ"')
    }).toThrowErrorMatchingInlineSnapshot(`"UTF-16 code of character 'Ā' is greater than FF."`)
  })

  it('should throw AddressError if address is invalid', () => {
    expect(() => {
      parse('mov [gg], al')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected number or register, got 'gg'."`)
  })

  it('should throw AddressError if address is empty', () => {
    expect(() => {
      parse('mov [], al')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected number or register, got ']'."`)
  })

  it('should throw UnterminatedAddressError if closing bracket is missing', () => {
    expect(() => {
      parse('mov [al')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated address '[al'."`)
  })

  it('should throw UnterminatedStringError if ending quote is missing', () => {
    expect(() => {
      parse('db "foo')
    }).toThrowErrorMatchingInlineSnapshot(`"Unterminated string '\\"foo'."`)
  })

  it('should throw SingleQuoteError if single quote is used', () => {
    expect(() => {
      parse("db 'foo'")
    }).toThrowErrorMatchingInlineSnapshot(`"Single quote is not allowed."`)
  })

  it('should throw OperandTypeError if token does not match any operand types', () => {
    expect(() => {
      parse('inc unknown')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected register, got 'unknown'."`)
  })

  it('should throw OperandTypeError with one expected type', () => {
    expect(() => {
      parse('inc [01]')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected register, got '[01]'."`)
  })

  it('should throw OperandTypeError with more than one expected types', () => {
    expect(() => {
      parse('mov 01')
    }).toThrowErrorMatchingInlineSnapshot(
      `"Expected register, address or register address, got '01'."`,
    )
  })

  describe('when parsing move instruction', () => {
    it('should throw OperandTypeError if second operand is of wrong type', () => {
      expect(() => {
        parse('mov al, bll')
      }).toThrowErrorMatchingInlineSnapshot(
        `"Expected number, address or register address, got 'bll'."`,
      )

      expect(() => {
        parse('mov [al], "01"')
      }).toThrowErrorMatchingInlineSnapshot(`"Expected register, got '\\"01\\"'."`)

      expect(() => {
        parse('mov [01], "02"')
      }).toThrowErrorMatchingInlineSnapshot(`"Expected register, got '\\"02\\"'."`)
    })

    it('should throw OperandTypeError if the types of two operands are not allowed', () => {
      expect(() => {
        parse('mov al, bl')
      }).toThrowErrorMatchingInlineSnapshot(
        `"Expected number, address or register address, got 'bl'."`,
      )

      expect(() => {
        parse('mov [01], 02')
      }).toThrowErrorMatchingInlineSnapshot(`"Expected register, got '02'."`)

      expect(() => {
        parse('mov [al], 01')
      }).toThrowErrorMatchingInlineSnapshot(`"Expected register, got '01'."`)
    })
  })

  it('should throw MissingCommaError', () => {
    expect(() => {
      parse('mov al 01')
    }).toThrowErrorMatchingInlineSnapshot(`"Expected comma, got '01'."`)
  })
})
