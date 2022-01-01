import React from 'react'
import Card from '../../common/components/Card'
import { useSelector } from '../../app/hooks'
import { selectTrafficLightsDataDigits } from './ioSlice'
import { range } from '../../common/utils'

const lightColors = ['red', 'yellow', 'lime'] as const

const TrafficLights = (): JSX.Element => {
  const dataDigits = useSelector(selectTrafficLightsDataDigits)

  return (
    <Card className="border-b border-r" title="Traffic Lights">
      <svg height="240" width="320" xmlns="http://www.w3.org/2000/svg">
        <g>
          <title>Background Layer</title>
          <rect fill="#a1a1aa" height="120" width="320" x="0" y="120" />
          <g fill="#000">
            {/* Left */}
            <rect height="112" width="48" x="32" y="24" />
            <rect height="80" width="16" x="48" y="136" />
            <rect height="12" width="32" x="40" y="216" />
            {/* Right */}
            <rect height="112" width="48" x="240" y="24" />
            <rect height="80" width="16" x="256" y="136" />
            <rect height="12" width="32" x="248" y="216" />
          </g>
          <g fill="none" stroke="white" strokeWidth="2">
            {/* Left */}
            <path d="M 44 44 L 36 44 L 36 132 L 52 132 L 52 180 L 104 180 L 104 200" />
            <path d="M 44 76 L 40 76 L 40 128 L 56 128 L 56 176 L 120 176 L 120 200" />
            <path d="M 68 108 L 72 108 L 72 132 L 60 132 L 60 172 L 136 172 L 136 200" />
            {/* Right */}
            <path d="M 252 44 L 244 44 L 244 132 L 260 132 L 260 172 L 152 172 L 152 200" />
            <path d="M 252 76 L 248 76 L 248 128 L 264 128 L 264 176 L 168 176 L 168 200" />
            <path d="M 276 108 L 280 108 L 280 132 L 268 132 L 268 180 L 184 180 L 184 200" />
            {/* Redundant */}
            <path d="M 200 200 L 200 184 L 284 184 L 284 160" />
            <path d="M 216 200 L 216 188 L 288 188 L 288 164" />
          </g>
          <g fill="#fff">
            {range(8).map(index => (
              <rect key={index} height="8" width="8" x={100 + index * 16} y="200" />
            ))}
          </g>
          <g className="font-mono" fill="#fff" textAnchor="middle">
            <text x="24" y="210">
              MSB
            </text>
            <text x="296" y="210">
              LSB
            </text>
          </g>
        </g>
        <g className="font-mono" fill="#fff" textAnchor="middle">
          <title>Data Layer</title>
          {dataDigits.map((digit, index) => (
            <text key={index} x={104 + index * 16} y="224">
              {digit}
            </text>
          ))}
        </g>
        <g>
          <title>Traffic Light Layer</title>
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
      </svg>
    </Card>
  )
}

export default TrafficLights
