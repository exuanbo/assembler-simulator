import { BehaviorSubject, filter, type Observable, share } from 'rxjs'

export type Signal = 0b0 | 0b1

export interface ControlLines {
  RD:   Signal
  WR:   Signal
  MREQ: Signal
  IORQ: Signal
  CLK:  Signal
  WAIT: Signal
  IRQ:  Signal
  HALT: Signal
}

export class Bus {
  // TODO: validate data and address
  readonly data$ = new BehaviorSubject(0x00)
  readonly address$ = new BehaviorSubject(0x00)

  readonly control$ = new BehaviorSubject<ControlLines>({
    RD:   0b0,
    WR:   0b0,
    MREQ: 0b0,
    IORQ: 0b0,
    CLK:  0b0,
    WAIT: 0b0,
    IRQ:  0b0,
    HALT: 0b0,
  })

  readonly clockRise$: Observable<ControlLines> = this.control$.pipe(
    filter((control, index) => (index && control.CLK)),
    share(),
  )

  setControl(signals: Partial<ControlLines>): void {
    const control = this.control$.getValue()
    this.control$.next(Object.assign(control, signals))
  }
}
