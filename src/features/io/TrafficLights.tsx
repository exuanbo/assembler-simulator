import { memo } from 'react'
import DeviceCard from './DeviceCard'
import { useSelector } from '@/app/hooks'
import { selectTrafficLightsDataDigits } from './ioSlice'
import { range } from '@/common/utils'

const StaticParts = memo(() => (
  <>
    <rect fill="#a1a1aa" height="120" width="320" x="0" y="120">
      <title>Background</title>
    </rect>
    <g fill="#000">
      <title>Pillar</title>
      {/* Left */}
      <rect height="112" width="48" x="32" y="24" />
      <rect height="80" width="16" x="48" y="136" />
      <rect height="12" width="32" x="40" y="216" />
      {/* Right */}
      <rect height="112" width="48" x="240" y="24" />
      <rect height="80" width="16" x="256" y="136" />
      <rect height="12" width="32" x="248" y="216" />
    </g>
    <g fill="none" stroke="#fff" strokeWidth="2">
      <title>Circut</title>
      {/* Left */}
      <polyline points="44,44 36,44 36,132 52,132 52,180 104,180 104,200" />
      <polyline points="44,76 40,76 40,128 56,128 56,176 120,176 120,200" />
      <polyline points="68,108 72,108 72,132 60,132 60,172 136,172 136,200" />
      {/* Right */}
      <polyline points="252,44 244,44 244,132 260,132 260,172 152,172 152,200" />
      <polyline points="252,76 248,76 248,128 264,128 264,176 168,176 168,200" />
      <polyline points="276,108 280,108 280,132 268,132 268,180 184,180 184,200" />
      {/* Redundant */}
      <polyline points="200,200 200,184 284,184 284,160" />
      <polyline points="216,200 216,188 288,188 288,164" />
    </g>
    <g fill="#fff">
      <title>Circut Node</title>
      {range(8).map(index => (
        <rect key={index} height="8" width="8" x={100 + index * 16} y="200" />
      ))}
    </g>
    <g className="font-mono" fill="#fff" textAnchor="middle">
      <title>Label</title>
      <text x="24" y="210">
        MSB
      </text>
      <text x="296" y="210">
        LSB
      </text>
    </g>
  </>
))

const lightColors = ['red', 'yellow', 'lime'] as const

const TrafficLights = (): JSX.Element => {
  const dataDigits = useSelector(selectTrafficLightsDataDigits)

  return (
    <DeviceCard name="Traffic Lights" port={1}>
      <svg viewBox="0 0 320 240" width="312" xmlns="http://www.w3.org/2000/svg">
        <g>
          <title>Static Layer</title>
          <StaticParts />
        </g>
        <g>
          <title>Lights Layer</title>
          {range(6).map(index => {
            const isOn = Boolean(dataDigits[index])
            return (
              <circle
                key={index}
                cx={index < 3 ? /* Left */ 56 : /* Right */ 264}
                cy={44 + (index % 3) * 32}
                fill={isOn ? lightColors[index % 3] : 'none'}
                r="12"
              />
            )
          })}
        </g>
        <g className="font-mono" fill="#fff" textAnchor="middle">
          <title>Data Layer</title>
          {dataDigits.map((digit, index) => (
            <text key={index} x={104 + index * 16} y="224">
              {digit}
            </text>
          ))}
        </g>
      </svg>
    </DeviceCard>
  )
}

export default TrafficLights
