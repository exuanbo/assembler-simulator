import { inject } from 'di-wise'
import { filter, map, type Observable, share } from 'rxjs'

import { Bus } from '../bus/bus'

export enum MemoryOperationType {
  READ  = 'READ',
  WRITE = 'WRITE',
}

export interface MemoryOperation {
  type: MemoryOperationType
  data: number
  address: number
}

export class Memory {
  private readonly data = new Uint8Array(0x100)

  readonly read$: Observable<MemoryOperation>
  readonly write$: Observable<MemoryOperation>

  private bus = inject(Bus)

  constructor() {
    const control$ = this.bus.control$.pipe(
      filter((control) => control.MREQ),
      share(),
    )

    this.read$ = control$.pipe(
      filter((control) => control.RD),
      map(this.read),
      share(),
    )

    this.write$ = control$.pipe(
      filter((control) => control.WR),
      map(this.write),
      share(),
    )

    this.read$.subscribe()
    this.write$.subscribe()
  }

  private read = (): MemoryOperation => {
    const address = this.bus.address$.getValue()
    const data = this.data[address]
    this.bus.data$.next(data)
    return {
      type: MemoryOperationType.READ,
      data,
      address,
    }
  }

  private write = (): MemoryOperation => {
    const address = this.bus.address$.getValue()
    const data = this.bus.data$.getValue()
    this.data[address] = data
    return {
      type: MemoryOperationType.WRITE,
      data,
      address,
    }
  }

  getData = (): number[] => {
    return Array.from(this.data)
  }

  subscribeData = (onDataChange: (() => void)): (() => void) => {
    const subscription = this.write$.subscribe(onDataChange)
    return () => subscription.unsubscribe()
  }

  load(data: Uint8Array, offset: number): void {
    this.data.set(data, offset)
  }

  reset(): void {
    this.data.fill(0)
  }
}
