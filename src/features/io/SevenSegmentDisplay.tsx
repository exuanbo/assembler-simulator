import { memo, useState, useEffect } from 'react'
import { createNextState } from '@reduxjs/toolkit'
import DeviceCard from './DeviceCard'
import { listenAction } from '@/app/actionListener'
import { IoDeviceName, resetIoState } from './ioSlice'
import { useIoDevice } from './hooks'
import { range } from '@/common/utils'

const StaticParts = memo(() => (
  <>
    <rect fill="#a1a1aa" height="300" width="320">
      <title>Background</title>
    </rect>
    <g fill="#000">
      <title>Screen</title>
      <rect height="128" width="80" x="40" y="56" />
      <rect height="128" width="80" x="192" y="56" />
    </g>
    <g fill="none" stroke="#fff" strokeWidth="2">
      <title>Circut</title>
      <g>
        <title>Digit 0</title>
        <polyline points="100,260 100,248 20,248 20,40 232,40 232,64" />
        <line x1="80" x2="80" y1="40" y2="64" />
        <line x1="56" x2="104" y1="64" y2="64" />
        <line x1="208" x2="256" y1="64" y2="64" />
      </g>
      <g>
        <title>Digit 1</title>
        <polyline points="116,260 116,240 28,240 28,48 188,48 188,92 204,92" />
        <line x1="28" x2="52" y1="92" y2="92" />
        <line x1="52" x2="52" y1="68" y2="116" />
        <line x1="204" x2="204" y1="68" y2="116" />
      </g>
      <g>
        <title>Digit 2</title>
        <polyline points="132,260 132,232 36,232 36,148 52,148" />
        <polyline points="132,232 208,232 208,192 188,192 188,148 204,148" />
        <line x1="52" x2="52" y1="124" y2="172" />
        <line x1="204" x2="204" y1="124" y2="172" />
      </g>
      <g>
        <title>Digit 3</title>
        <polyline points="148,260 148,224 80,224 80,176" />
        <polyline points="148,224 232,224 232,176" />
        <line x1="56" x2="104" y1="176" y2="176" />
        <line x1="208" x2="256" y1="176" y2="176" />
      </g>
      <g>
        <title>Digit 4</title>
        <polyline points="164,260 164,216 124,216 124,148 108,148" />
        <polyline points="164,216 276,216 276,148 260,148" />
        <line x1="108" x2="108" y1="124" y2="172" />
        <line x1="260" x2="260" y1="124" y2="172" />
      </g>
      <g>
        <title>Digit 5</title>
        <polyline points="180,260 180,208 132,208 132,120 56,120" />
        <polyline points="180,208 284,208 284,120 208,120" />
      </g>
      <g>
        <title>Digit 6</title>
        <polyline points="196,260 196,200 140,200 140,92 108,92" />
        <polyline points="196,200 292,200 292,92 260,92" />
        <line x1="108" x2="108" y1="68" y2="116" />
        <line x1="260" x2="260" y1="68" y2="116" />
      </g>
      <g>
        <title>Digit 7</title>
        <polyline points="212,260 212,240 300,240 300,24 204,24" />
        <g fill="#a1a1aa">
          <title>Inverter</title>
          <polygon points="204,24 204,14 194,24 204,34 204,24" />
          <circle cx="190" cy="24" r="2" />
        </g>
        <polyline points="188,24 118,24 118,56" />
        <line x1="270" x2="270" y1="24" y2="56" />
      </g>
    </g>
    <g fill="#fff">
      <title>Circut Node</title>
      {range(8).map(index => (
        <rect key={index} height="8" width="8" x={96 + index * 16} y="260" />
      ))}
      {range(5).map(index => (
        <rect key={index} height="4" width="8" x={128 + index * 16} y={230 - index * 8} />
      ))}
      <rect height="4" width="8" x="76" y="38" />
      <rect height="4" width="8" x="24" y="90" />
      <rect height="4" width="8" x="266" y="22" />
      <rect height="8" width="8" x="266" y="54" />
      <rect height="8" width="8" x="114" y="54" />
    </g>
    <g fill="#fff" textAnchor="middle">
      <title>Label</title>
      <text x="60" y="270">
        MSB
      </text>
      <text x="252" y="270">
        LSB
      </text>
    </g>
  </>
))

if (import.meta.env.DEV) {
  StaticParts.displayName = 'StaticParts'
}

const segments: readonly JSX.Element[] = [
  // 0
  <polygon key={0} points="56,64 104,64 96,72 64,72" />,
  <polygon key={1} points="208,64 256,64 248,72 216,72" />,
  // 1
  <polygon key={2} points="52,68 60,76 60,108 52,116" />,
  <polygon key={3} points="204,68 212,76 212,108 204,116" />,
  // 2
  <polygon key={4} points="52,124 60,132 60,164 52,172" />,
  <polygon key={5} points="204,124 212,132 212,164 204,172" />,
  // 3
  <polygon key={6} points="56,176 64,168 96,168 104,176" />,
  <polygon key={7} points="208,176 216,168 248,168 256,176" />,
  // 4
  <polygon key={8} points="108,124 108,172 100,164 100,132" />,
  <polygon key={9} points="260,124 260,172 252,164 252,132" />,
  // 5
  <polygon key={10} points="56,120 60,116 100,116 104,120 100,124 60,124" />,
  <polygon key={11} points="208,120 212,116 252,116 256,120 252,124 212,124" />,
  // 6
  <polygon key={12} points="108,68 108,116 100,108 100,76" />,
  <polygon key={13} points="260,68 260,116 252,108 252,76" />
]

const initialData = new Array<number>(14).fill(0)

const SevenSegmentDisplay = (): JSX.Element | null => {
  // an array of 14 numbers,
  // elements with even index represent the left part
  const [data, setData] = useState(initialData)

  useEffect(() => {
    return listenAction(resetIoState, () => {
      setData(initialData)
    })
  }, [])

  const {
    data: outputData,
    isVisible,
    toggleVisible
  } = useIoDevice(IoDeviceName.SevenSegmentDisplay)

  useEffect(() => {
    const newData = createNextState(data, draft => {
      for (let i = outputData[7]; i < 14; i += 2) {
        draft[i] = outputData[Math.floor(i / 2)]
      }
    })
    setData(newData)
  }, [outputData])

  return isVisible ? (
    <DeviceCard name="Seven-segment Display" onClickClose={toggleVisible}>
      <svg viewBox="0 0 320 300" width="320" xmlns="http://www.w3.org/2000/svg">
        <g>
          <title>Static Layer</title>
          <StaticParts />
        </g>
        <g fill="lime" stroke="lime" strokeWidth="2">
          <title>Segments Layer</title>
          {segments.filter((_, index) => data[index] === 1)}
        </g>
        <g fill="#fff" textAnchor="middle">
          <title>Data Layer</title>
          {outputData.map((digit, index) => (
            <text key={index} x={100 + index * 16} y="284">
              {digit}
            </text>
          ))}
        </g>
      </svg>
    </DeviceCard>
  ) : null
}

export default SevenSegmentDisplay
