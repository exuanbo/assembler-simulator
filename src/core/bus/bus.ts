import { asapScheduler, BehaviorSubject, filter, observeOn, shareReplay, skipWhile } from 'rxjs'

export const enum Control {
  CLOCK_IDLE   = 0b0000,
  MEMORY_READ  = 0b1000,
  IO_READ      = 0b1001,
  MEMORY_WRITE = 0b1010,
  IO_WRITE     = 0b1011,
  INTERRUPT    = 0b1100,
}

export interface Signals {
  data: number
  address: number
  control: Control
}

const initialSignals: Signals = {
  data: 0x00,
  address: 0x00,
  control: Control.CLOCK_IDLE,
}

export class Bus {
  private readonly source$ = new BehaviorSubject(initialSignals)

  private readonly shared$ = this.source$.pipe(
    observeOn(asapScheduler),
    shareReplay(1),
  )

  get signals$() {
    return this.shared$
  }

  get idle$() {
    return this.shared$.pipe(
      filter((signals) => (signals.control === Control.CLOCK_IDLE)),
    )
  }

  put(next: Partial<Signals>) {
    const nextSignals = {
      ...this.source$.getValue(),
      ...next,
    }
    this.source$.next(nextSignals)
    return this.shared$.pipe(
      skipWhile((signals) => (signals !== nextSignals)),
    )
  }
}
