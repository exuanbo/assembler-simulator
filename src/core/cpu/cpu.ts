import { filter, firstValueFrom, map, skipUntil } from 'rxjs'

import { type Bus, Control, type Signals } from '../bus/bus'

export class Cpu {
  constructor(
    private readonly bus: Bus,
  ) {
    this.bus.signals$.pipe(
      filter((signals) => (signals.control === Control.INTERRUPT)),
    ).subscribe(this.handleInterrupt)
  }

  async step() {
    // TODO: implement step
    // const opcode = await this.readMemory(...)
  }

  private readMemory(address: number) {
    const data$ = this.bus.put({
      address,
      control: Control.MEMORY_READ,
    }).pipe(
      skipUntil(this.bus.idle$),
      map((signals) => signals.data),
    )
    return firstValueFrom(data$)
  }

  private writeMemory(address: number, data: number) {
    const complete$ = this.bus.put({
      data,
      address,
      control: Control.MEMORY_WRITE,
    })
    return firstValueFrom(complete$)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleInterrupt = (_signals: Signals) => {
    // TODO: implement interrupt handling
  }
}
