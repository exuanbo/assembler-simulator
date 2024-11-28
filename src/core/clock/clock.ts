import { inject } from 'di-wise'

import { Bus } from '../bus/bus'

export class Clock {
  private bus = inject(Bus)

  tick = (): void => {
    this.bus.setControl({ CLK: 0b1 })
    this.bus.setControl({ CLK: 0b0 })
  }
}
