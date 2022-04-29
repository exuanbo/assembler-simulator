import newFileTemplate from './new_file_template.asm?raw'
import procedures from './procedures.asm?raw'
import softwareInterrupts from './software_interrupts.asm?raw'
import hardwareInterrupts from './hardware_interrupts.asm?raw'
import keyboardInput from './keyboard_input.asm?raw'
import visualDisplayUnit from './visual_display_unit.asm?raw'
import trafficLights from './traffic_lights.asm?raw'
import sevenSegmentDisplay from './seven_segment_display.asm?raw'

export const NEW_FILE_TEMPLATE = newFileTemplate

interface Example {
  name: string
  content: string
}

export const examples: readonly Example[] = [
  {
    name: 'Procedures',
    content: procedures
  },
  {
    name: 'Software Interrupts',
    content: softwareInterrupts
  },
  {
    name: 'Hardware Interrupts',
    content: hardwareInterrupts
  },
  {
    name: 'Keyboard Input',
    content: keyboardInput
  },
  {
    name: 'Visual Display Unit',
    content: visualDisplayUnit
  },
  {
    name: 'Traffic Lights',
    content: trafficLights
  },
  {
    name: 'Seven-segment Display',
    content: sevenSegmentDisplay
  }
]
