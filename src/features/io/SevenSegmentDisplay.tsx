import { createNextState } from '@reduxjs/toolkit'
import { memo, useState, useEffect } from 'react'
import DeviceCard from './DeviceCard'
import { useSelector } from '@/app/hooks'
import { listenAction } from '@/app/store'
import { selectSevenSegmentDisplayDataDigits, resetIo } from './ioSlice'
import { range } from '@/common/utils'

const StaticParts = memo(() => (
  <>
    <rect fill="#a1a1aa" height="320" width="320">
      <title>Background</title>
    </rect>
    <g fill="#000">
      <title>Screen</title>
      <rect height="128" width="80" x="40" y="76" />
      <rect height="128" width="80" x="192" y="76" />
    </g>
    <g fill="none" stroke="#fff" strokeWidth="2">
      <title>Circut</title>
      <g>
        <title>Digit 0</title>
        <polyline points="100,280 100,268 20,268 20,60 232,60 232,84" />
        <line x1="80" x2="80" y1="60" y2="84" />
        <line x1="56" x2="104" y1="84" y2="84" />
        <line x1="208" x2="256" y1="84" y2="84" />
      </g>
      <g>
        <title>Digit 1</title>
        <polyline points="116,280 116,260 28,260 28,68 188,68 188,112 204,112" />
        <line x1="28" x2="52" y1="112" y2="112" />
        <line x1="52" x2="52" y1="88" y2="136" />
        <line x1="204" x2="204" y1="88" y2="136" />
      </g>
      <g>
        <title>Digit 2</title>
        <polyline points="132,280 132,252 36,252 36,168 52,168" />
        <polyline points="132,252 208,252 208,212 188,212 188,168 204,168" />
        <line x1="52" x2="52" y1="144" y2="192" />
        <line x1="204" x2="204" y1="144" y2="192" />
      </g>
      <g>
        <title>Digit 3</title>
        <polyline points="148,280 148,244 80,244 80,196" />
        <polyline points="148,244 232,244 232,196" />
        <line x1="56" x2="104" y1="196" y2="196" />
        <line x1="208" x2="256" y1="196" y2="196" />
      </g>
      <g>
        <title>Digit 4</title>
        <polyline points="164,280 164,236 124,236 124,168 108,168" />
        <polyline points="164,236 276,236 276,168 260,168" />
        <line x1="108" x2="108" y1="144" y2="192" />
        <line x1="260" x2="260" y1="144" y2="192" />
      </g>
      <g>
        <title>Digit 5</title>
        <polyline points="180,280 180,228 132,228 132,140 56,140" />
        <polyline points="180,228 284,228 284,140 208,140" />
      </g>
      <g>
        <title>Digit 6</title>
        <polyline points="196,280 196,220 140,220 140,112 108,112" />
        <polyline points="196,220 292,220 292,112 260,112" />
        <line x1="108" x2="108" y1="88" y2="136" />
        <line x1="260" x2="260" y1="88" y2="136" />
      </g>
      <g>
        <title>Digit 7</title>
        <polyline points="212,280 212,260 300,260 300,36 215,36" />
        <g fill="#a1a1aa">
          <title>Inverter</title>
          <polygon points="215,36 215,20 199,36 215,52 215,36" />
          <circle cx="194" cy="36" r="3" />
        </g>
        <polyline points="190,36 118,36 118,76" />
        <line x1="270" x2="270" y1="36" y2="76" />
      </g>
    </g>
    <g fill="#fff">
      <title>Circut Node</title>
      {range(8).map(index => (
        <rect key={index} height="8" width="8" x={96 + index * 16} y="280" />
      ))}
      {range(5).map(index => (
        <rect key={index} height="4" width="8" x={128 + index * 16} y={250 - index * 8} />
      ))}
      <rect height="4" width="8" x="76" y="58" />
      <rect height="4" width="8" x="24" y="110" />
      <rect height="4" width="8" x="266" y="34" />
      <rect height="8" width="8" x="266" y="74" />
      <rect height="8" width="8" x="114" y="74" />
    </g>
    <g className="font-mono" fill="#fff" textAnchor="middle">
      <title>Label</title>
      <text x="60" y="290">
        MSB
      </text>
      <text x="252" y="290">
        LSB
      </text>
    </g>
  </>
))

const segments: readonly JSX.Element[] = [
  // 0
  <polygon key={0} points="56,84 104,84 96,92 64,92" />,
  <polygon key={1} points="208,84 256,84 248,92 216,92" />,
  // 1
  <polygon key={2} points="52,88 60,96 60,128 52,136" />,
  <polygon key={3} points="204,88 212,96 212,128 204,136" />,
  // 2
  <polygon key={4} points="52,144 60,152 60,184 52,192" />,
  <polygon key={5} points="204,144 212,152 212,184 204,192" />,
  // 3
  <polygon key={6} points="56,196 64,188 96,188 104,196" />,
  <polygon key={7} points="208,196 216,188 248,188 256,196" />,
  // 4
  <polygon key={8} points="108,144 108,192 100,184 100,152" />,
  <polygon key={9} points="260,144 260,192 252,184 252,152" />,
  // 5
  <polygon key={10} points="56,140 60,136 100,136 104,140 100,144 60,144" />,
  <polygon key={11} points="208,140 212,136 252,136 256,140 252,144 212,144" />,
  // 6
  <polygon key={12} points="108,88 108,136 100,128 100,96" />,
  <polygon key={13} points="260,88 260,136 252,128 252,96" />
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
      <svg viewBox="0 0 320 320" width="312" xmlns="http://www.w3.org/2000/svg">
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
            <text key={index} x={100 + index * 16} y="304">
              {digit}
            </text>
          ))}
        </g>
      </svg>
    </DeviceCard>
  )
}

export default SevenSegmentDisplay
