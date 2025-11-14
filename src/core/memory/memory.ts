import { inject } from 'di-wise'
import { BehaviorSubject, filter, map, type Observable } from 'rxjs'

import { asObservable } from '@/common/asObservable'

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
  private _buffer$ = new BehaviorSubject(new Uint8Array(0x100))
  readonly buffer$ = asObservable(this._buffer$)

  private get buffer() {
    return this._buffer$.getValue()
  }

  private notifyDataChange = () => {
    this._buffer$.next(this.buffer)
  }

  readonly read$: Observable<MemoryOperation>
  readonly write$: Observable<MemoryOperation>

  private bus = inject(Bus)

  constructor() {
    this.read$ = this.bus.control$.pipe(
      filter((control) => control.MREQ && control.RD),
      map(this.read),
    )
    this.read$.subscribe()
    this.write$ = this.bus.control$.pipe(
      filter((control) => control.MREQ && control.WR),
      map(this.write),
    )
    this.write$.subscribe(this.notifyDataChange)
  }

  private read = (): MemoryOperation => {
    const address = this.bus.address$.getValue()
    const data = this.buffer[address]
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
    this.buffer[address] = data
    return {
      type: MemoryOperationType.WRITE,
      data,
      address,
    }
  }

  load(data: ArrayLike<number>, offset: number): void {
    this.buffer.set(data, offset)
    this.notifyDataChange()
  }

  reset(): void {
    this.buffer.fill(0)
    this.notifyDataChange()
  }
}
