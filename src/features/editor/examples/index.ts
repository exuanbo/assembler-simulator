import __template from './template.asm?raw'
import procedures from './procedures.asm?raw'
import softwareInterrupts from './software_interrupts.asm?raw'
import hardwareInterrupts from './hardware_interrupts.asm?raw'
import keyboardInput from './keyboard_input.asm?raw'
import visualDisplayUnit from './visual_display_unit.asm?raw'
import trafficLights from './traffic_lights.asm?raw'
import sevenSegmentDisplay from './seven_segment_display.asm?raw'

const TITLE_REGEXP = /;\t(.*)/

const getTitleFrom = (content: string): string => TITLE_REGEXP.exec(content)![1]

interface Example {
  title: string
  content: string
}

export const template: Example = {
  title: getTitleFrom(__template),
  content: __template
}

export const examples: readonly Example[] = [
  procedures,
  softwareInterrupts,
  hardwareInterrupts,
  keyboardInput,
  visualDisplayUnit,
  trafficLights,
  sevenSegmentDisplay
].map(content => {
  return {
    title: getTitleFrom(content),
    content
  }
})
