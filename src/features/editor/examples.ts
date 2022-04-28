import newFileTemplate from './examples/new_file_template.asm?raw'
import procedures from './examples/procedures.asm?raw'
import softwareInterrupts from './examples/software_interrupts.asm?raw'
import hardwareInterrupts from './examples/hardware_interrupts.asm?raw'
import keyboardInput from './examples/keyboard_input.asm?raw'
import visualDisplayUnit from './examples/visual_display_unit.asm?raw'
import trafficLights from './examples/traffic_lights.asm?raw'
import sevenSegmentDisplay from './examples/seven_segment_display.asm?raw'

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
