import { createNextState, nanoid } from '@reduxjs/toolkit'
import { memo, useState, useEffect } from 'react'
import DeviceCard from './DeviceCard'
import { useSelector } from '@/app/hooks'
import { listenAction } from '@/app/store'
import { selectSevenSegmentDisplayDataDigits, resetIo } from './ioSlice'
import { range } from '@/common/utils'

const StaticParts = memo(() => (
  <>
    <rect fill="#a1a1aa" height="300" width="312">
      <title>Background</title>
    </rect>
    <g fill="#000">
      <title>Screen</title>
      <rect height="128" width="80" x="36" y="56" />
      <rect height="128" width="80" x="188" y="56" />
    </g>
    <g fill="none" stroke="#fff" strokeWidth="2">
      <title>Circut</title>
      <g>
        <title>Digit 0</title>
        <polyline points="96,260 96,248 16,248 16,40 228,40 228,64" />
        <line x1="76" x2="76" y1="40" y2="64" />
        <line x1="52" x2="100" y1="64" y2="64" />
        <line x1="204" x2="252" y1="64" y2="64" />
      </g>
      <g>
        <title>Digit 1</title>
        <polyline points="112,260 112,240 24,240 24,48 184,48 184,92 200,92" />
        <line x1="24" x2="48" y1="92" y2="92" />
        <line x1="48" x2="48" y1="68" y2="116" />
        <line x1="200" x2="200" y1="68" y2="116" />
      </g>
      <g>
        <title>Digit 2</title>
        <polyline points="128,260 128,232 32,232 32,148 48,148" />
        <polyline points="128,232 204,232 204,192 184,192 184,148 200,148" />
        <line x1="48" x2="48" y1="124" y2="172" />
        <line x1="200" x2="200" y1="124" y2="172" />
      </g>
      <g>
        <title>Digit 3</title>
        <polyline points="144,260 144,224 76,224 76,176" />
        <polyline points="144,224 228,224 228,176" />
        <line x1="52" x2="100" y1="176" y2="176" />
        <line x1="204" x2="252" y1="176" y2="176" />
      </g>
      <g>
        <title>Digit 4</title>
        <polyline points="160,260 160,216 120,216 120,148 104,148" />
        <polyline points="160,216 272,216 272,148 256,148" />
        <line x1="104" x2="104" y1="124" y2="172" />
        <line x1="256" x2="256" y1="124" y2="172" />
      </g>
      <g>
        <title>Digit 5</title>
        <polyline points="176,260 176,208 128,208 128,120 52,120" />
        <polyline points="176,208 280,208 280,120 204,120" />
      </g>
      <g>
        <title>Digit 6</title>
        <polyline points="192,260 192,200 136,200 136,92 104,92" />
        <polyline points="192,200 288,200 288,92 256,92" />
        <line x1="104" x2="104" y1="68" y2="116" />
        <line x1="256" x2="256" y1="68" y2="116" />
      </g>
      <g>
        <title>Digit 7</title>
        <polyline points="208,260 208,240 296,240 296,24 200,24" />
        <g fill="#a1a1aa">
          <title>Inverter</title>
          <polygon points="200,24 200,14 190,24 200,34 200,24" />
          <circle cx="186" cy="24" r="2" />
        </g>
        <polyline points="184,24 114,24 114,56" />
        <line x1="266" x2="266" y1="24" y2="56" />
      </g>
    </g>
    <g fill="#fff">
      <title>Circut Node</title>
      {range(8).map(index => (
        <rect key={index} height="8" width="8" x={92 + index * 16} y="260" />
      ))}
      {range(5).map(index => (
        <rect key={index} height="4" width="8" x={124 + index * 16} y={230 - index * 8} />
      ))}
      <rect height="4" width="8" x="72" y="38" />
      <rect height="4" width="8" x="20" y="90" />
      <rect height="4" width="8" x="262" y="22" />
      <rect height="8" width="8" x="262" y="54" />
      <rect height="8" width="8" x="110" y="54" />
    </g>
    <g className="font-mono" fill="#fff" textAnchor="middle">
      <title>Label</title>
      <text x="56" y="270">
        MSB
      </text>
      <text x="248" y="270">
        LSB
      </text>
    </g>
  </>
))

const segments: readonly JSX.Element[] = [
  // 0
  <polygon key={nanoid()} points="52,64 100,64 92,72 60,72" />,
  <polygon key={nanoid()} points="204,64 252,64 244,72 212,72" />,
  // 1
  <polygon key={nanoid()} points="48,68 56,76 56,108 48,116" />,
  <polygon key={nanoid()} points="200,68 208,76 208,108 200,116" />,
  // 2
  <polygon key={nanoid()} points="48,124 56,132 56,164 48,172" />,
  <polygon key={nanoid()} points="200,124 208,132 208,164 200,172" />,
  // 3
  <polygon key={nanoid()} points="52,176 60,168 92,168 100,176" />,
  <polygon key={nanoid()} points="204,176 212,168 244,168 252,176" />,
  // 4
  <polygon key={nanoid()} points="104,124 104,172 96,164 96,132" />,
  <polygon key={nanoid()} points="256,124 256,172 248,164 248,132" />,
  // 5
  <polygon key={nanoid()} points="52,120 56,116 96,116 100,120 96,124 56,124" />,
  <polygon key={nanoid()} points="204,120 208,116 248,116 252,120 248,124 208,124" />,
  // 6
  <polygon key={nanoid()} points="104,68 104,116 96,108 96,76" />,
  <polygon key={nanoid()} points="256,68 256,116 248,108 248,76" />
]

const initialDataDigits: readonly number[] = Array(14).fill(0)

const SevenSegmentDisplay = (): JSX.Element => {
  const [dataDigits, setDataDigits] = useState(initialDataDigits)
  const outputDataDigits = useSelector(selectSevenSegmentDisplayDataDigits)

  useEffect(() => {
    const newDataDigits = createNextState(dataDigits, draft => {
      for (let i = outputDataDigits[7]; i < 14; i += 2) {
        draft[i] = outputDataDigits[Math.floor(i / 2)]
      }
    })
    setDataDigits(newDataDigits)
  }, [outputDataDigits])

  useEffect(() => {
    return listenAction(resetIo, () => {
      setDataDigits(initialDataDigits)
    })
  }, [])

  return (
    <DeviceCard name="Seven-Segment Display" port={2}>
      <svg viewBox="0 0 312 300" width="312" xmlns="http://www.w3.org/2000/svg">
        <g>
          <title>Static Layer</title>
          <StaticParts />
        </g>
        <g fill="lime" stroke="lime" strokeWidth="2">
          <title>Segments Layer</title>
          {segments.filter((_, index) => dataDigits[index] === 1)}
        </g>
        <g className="font-mono" fill="#fff" textAnchor="middle">
          <title>Data Layer</title>
          {outputDataDigits.map((digit, index) => (
            <text key={index} x={96 + index * 16} y="284">
              {digit}
            </text>
          ))}
        </g>
      </svg>
    </DeviceCard>
  )
}

export default SevenSegmentDisplay
