import { filter, map, type Observable, share, tap } from 'rxjs'

import { type Bus, Control, type Signals } from '../bus/bus'

export class Memory {
  // TODO: use shared constants
  private readonly data = new Uint8Array(0x100)

  private readonly read$: Observable<Signals>
  private readonly write$: Observable<Signals>

  constructor(
    private readonly bus: Bus,
  ) {
    this.read$ = this.bus.signals$.pipe(
      filter((signals) => signals.control === Control.MEMORY_READ),
      tap(this.read),
      share(),
    )

    this.write$ = this.bus.signals$.pipe(
      filter((signals) => signals.control === Control.MEMORY_WRITE),
      tap(this.write),
      share(),
    )

    this.read$.subscribe()
    this.write$.subscribe()
  }

  private read = (signals: Signals) => {
    this.bus.put({
      data: this.data[signals.address],
      control: Control.CLOCK_IDLE,
    })
  }

  private write = (signals: Signals) => {
    this.data[signals.address] = signals.data
    this.bus.put({
      control: Control.CLOCK_IDLE,
    })
  }

  get data$() {
    return this.write$.pipe(map(() => this.getData()))
  }

  getData() {
    return Array.from(this.data)
  }

  load(data: Uint8Array, offset: number) {
    this.data.set(data, offset)
  }

  reset() {
    this.data.fill(0)
  }
}
