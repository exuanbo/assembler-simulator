export const SKIP = -1

export const MAX_PORT = 0x0f

export enum InputPort {
  SimulatedKeyboard = 0,
  Thermostat = 3,
  Keyboard = 7,
  NumericKeypad = 8,
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
    port: null,
  },
  interrupt: false,
}

export enum OutputPort {
  TrafficLights = 1,
  SevenSegmentDisplay = 2,
  Heater = 3,
  SnakeInMaze = 4,
  StepperMotor = 5,
  Lift = 6,
  Keyboard = 7,
  NumericKeypad = 8,
}

type OutputFlagSignalName = 'halted' | 'closeWindows'

type OutputFlagSignals = {
  [signalName in OutputFlagSignalName]?: true
}

interface OutputData {
  content: number
  port: OutputPort
}

export interface OutputSignals extends OutputFlagSignals {
  expectedInputPort?: InputPort
  data?: OutputData
}

export interface Signals {
  input: InputSignals
  output: OutputSignals
}
