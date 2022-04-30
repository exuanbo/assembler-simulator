import { memo } from 'react'
import DeviceCard from './DeviceCard'
import { IoDeviceName } from './ioSlice'
import { useIoDevice } from './hooks'
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
      <rect height="112" width="48" x="232" y="24" />
      <rect height="80" width="16" x="248" y="136" />
      <rect height="12" width="32" x="240" y="216" />
    </g>
    <g fill="none" stroke="#fff" strokeWidth="2">
      <title>Circut</title>
      {/* Left */}
      <polyline points="44,44 36,44 36,132 52,132 52,180 100,180 100,200" />
      <polyline points="44,76 40,76 40,128 56,128 56,176 116,176 116,200" />
      <polyline points="68,108 72,108 72,132 60,132 60,172 132,172 132,200" />
      {/* Right */}
      <polyline points="244,44 236,44 236,132 252,132 252,172 148,172 148,200" />
      <polyline points="244,76 240,76 240,128 256,128 256,176 164,176 164,200" />
      <polyline points="268,108 272,108 272,132 260,132 260,180 180,180 180,200" />
      {/* Redundant */}
      <polyline points="196,200 196,184 276,184 276,160" />
      <polyline points="212,200 212,188 280,188 280,164" />
    </g>
    <g fill="#fff">
      <title>Circut Node</title>
      {range(8).map(index => (
        <rect key={index} height="8" width="8" x={96 + index * 16} y="200" />
      ))}
    </g>
    <g fill="#fff" textAnchor="middle">
      <title>Label</title>
      <text x="24" y="210">
        MSB
      </text>
      <text x="288" y="210">
        LSB
      </text>
    </g>
  </>
))

if (import.meta.env.DEV) {
  StaticParts.displayName = 'StaticParts'
}

const lightColors = ['red', 'yellow', 'lime'] as const

const TrafficLights = (): JSX.Element | null => {
  const { data, isVisible, toggleVisible } = useIoDevice(IoDeviceName.TrafficLights)

  return isVisible ? (
    <DeviceCard name="Traffic Lights" onClickClose={toggleVisible}>
      <svg viewBox="0 0 312 240" width="312" xmlns="http://www.w3.org/2000/svg">
        <g>
          <title>Static Layer</title>
          <StaticParts />
        </g>
        <g>
          <title>Lights Layer</title>
          {range(6).map(index => {
            const isOn = Boolean(data[index])
            return (
              <circle
                key={index}
                cx={index < 3 ? 56 : 256}
                cy={44 + (index % 3) * 32}
                fill={isOn ? lightColors[index % 3] : 'none'}
                r="12"
              />
            )
          })}
        </g>
        <g fill="#fff" textAnchor="middle">
          <title>Data Layer</title>
          {data.map((digit, index) => (
            <text key={index} x={100 + index * 16} y="224">
              {digit}
            </text>
          ))}
        </g>
      </svg>
    </DeviceCard>
  ) : null
}

export default TrafficLights
