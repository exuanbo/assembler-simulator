import type { Nullable } from '../../common/utils'

export const MAX_PORT = 0x0f

export enum PortType {
  Input = 'input',
  Output = 'output'
}

export enum InputPort {
  SimulatedKeyboard = 0,
  Thermostat = 3,
  Keyboard = 7,
  NumericKeypad = 8
}

type InputData = Nullable<{
  content: number
  port: InputPort
}>

export interface InputSignals {
  data: InputData
  interrupt: boolean
  // TODO: interruptVectorAddress
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

type OutputData = Nullable<{
  content: number
  port: OutputPort
}>

export interface OutputSignals {
  data: OutputData
  halted: boolean
  closeWindows: boolean
}

export interface Signals {
  input: InputSignals
  output: OutputSignals
}

export const initialSignals: Signals = {
  input: {
    data: {
      content: null,
      port: null
    },
    interrupt: false
  },
  output: {
    data: {
      content: null,
      port: null
    },
    halted: false,
    closeWindows: false
  }
}
