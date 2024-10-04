import { type Observable, take } from 'rxjs'

import type { Bus, ControlLines } from '../bus/bus'

type AsyncControlGenerator<T> = Generator<Observable<ControlLines>, T, ControlLines>

export class Cpu {
  constructor(
    private readonly bus: Bus,
  ) {}

  *step(): AsyncControlGenerator<void> {
    const x = yield* this.readMemory(0x00)
    const y = yield* this.readMemory(0x01)
    const result = x + y
    yield* this.writeMemory(result, 0x02)
  }

  *readMemory(address: number): AsyncControlGenerator<number> {
    this.bus.address$.next(address)
    this.bus.setControl({
      RD:   0b1,
      MREQ: 0b1,
    })
    yield this.bus.clockRise$.pipe(take(1))
    this.bus.setControl({
      RD:   0b0,
      MREQ: 0b0,
    })
    return this.bus.data$.getValue()
  }

  *writeMemory(data: number, address: number): AsyncControlGenerator<void> {
    this.bus.data$.next(data)
    this.bus.address$.next(address)
    this.bus.setControl({
      WR:   0b1,
      MREQ: 0b1,
    })
    yield this.bus.clockRise$.pipe(take(1))
    this.bus.setControl({
      WR:   0b0,
      MREQ: 0b0,
    })
  }
}
