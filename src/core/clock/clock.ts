import type { Bus } from '../bus/bus'

export class Clock {
  constructor(
    private readonly bus: Bus,
  ) {}

  tick = (): void => {
    this.bus.setControl({ CLK: 0b1 })
    this.bus.setControl({ CLK: 0b0 })
  }
}
