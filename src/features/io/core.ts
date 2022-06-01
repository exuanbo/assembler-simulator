export const SKIP = -1

export const MAX_PORT = 0x0f

export enum InputPort {
  SimulatedKeyboard = 0,
  Thermostat = 3,
  Keyboard = 7,
  NumericKeypad = 8
}

export type InputData =
  | {
      content: number
      port: InputPort
    }
  | {
      content: null
      port: null
    }

export interface InputSignals {
  data: InputData
  interrupt: boolean
  // TODO: interruptVectorAddress
}

export const initialInputSignals: InputSignals = {
  data: {
    content: null,
    port: null
  },
  interrupt: false
}

export enum OutputPort {
  TrafficLights = 1,
  SevenSegmentDisplay = 2,
  Heater = 3,
  SnakeInMaze = 4,
  StepperMotor = 5,
  Lift = 6,
  Keyboard = 7,
  NumericKeypad = 8
}

interface OutputData {
  content: number
  port: OutputPort
}

export type OutputSignals = Partial<{
  halted: true
  requiredInputPort: InputPort
  data: OutputData
  closeWindows: true
}>

export interface Signals {
  input: InputSignals
  output: OutputSignals
}
