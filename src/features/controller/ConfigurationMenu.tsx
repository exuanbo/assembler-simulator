import React, { useReducer, useRef } from 'react'
import MenuItem from './MenuItem'
import { CheckMark, Wrench, Play } from '../../common/components/icons'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
  ClockSpeed,
  CLOCK_SPEED_KEYS,
  TimerInterval,
  TIMER_INTERVAL_KEYS,
  setClockSpeed,
  setTimerInterval,
  selectClockSpeed,
  selectTimerInterval
} from './controllerSlice'
import { useOutsideClick } from './hooks'

const ClockSpeedMenu = (): JSX.Element => {
  const menuItemsRef = useRef<HTMLDivElement>(null)

  const handleClick = (event: React.MouseEvent): void => {
    const { current } = menuItemsRef
    const { target } = event
    if (current !== null && target instanceof Element && !current.contains(target)) {
      event.stopPropagation()
    }
  }

  const dispatch = useAppDispatch()
  const clockSpeed = useAppSelector(selectClockSpeed)

  return (
    <MenuItem className="justify-between" onClick={handleClick}>
      {isHovered => (
        <>
          <div className="flex space-x-2 items-center">
            <span className="w-4" />
            <span>Clock Speed</span>
          </div>
          <Play className="h-2.5" />
          {isHovered ? (
            <div
              ref={menuItemsRef}
              className="divide-y border bg-gray-50 shadow top-8 left-60 w-60 fixed">
              {CLOCK_SPEED_KEYS.map((clockSpeedKey, index) => {
                return (
                  <MenuItem
                    key={index}
                    className="space-x-2"
                    onClick={() => dispatch(setClockSpeed(ClockSpeed[clockSpeedKey]))}>
                    {() => (
                      <>
                        {clockSpeed === ClockSpeed[clockSpeedKey] ? (
                          <CheckMark />
                        ) : (
                          <span className="w-4" />
                        )}
                        <span>{clockSpeedKey}</span>
                      </>
                    )}
                  </MenuItem>
                )
              })}
            </div>
          ) : null}
        </>
      )}
    </MenuItem>
  )
}

const TimerIntervalMenu = (): JSX.Element => {
  const menuItemsRef = useRef<HTMLDivElement>(null)

  const handleClick = (event: React.MouseEvent): void => {
    const { current } = menuItemsRef
    const { target } = event
    if (current !== null && target instanceof Element && !current.contains(target)) {
      event.stopPropagation()
    }
  }

  const dispatch = useAppDispatch()
  const timerInterval = useAppSelector(selectTimerInterval)

  return (
    <MenuItem className="justify-between" onClick={handleClick}>
      {isHovered => (
        <>
          <div className="flex space-x-2 items-center">
            <span className="w-4" />
            <span>Timer Interval</span>
          </div>
          <Play className="h-2.5" />
          {isHovered ? (
            <div
              ref={menuItemsRef}
              className="divide-y border bg-gray-50 shadow mt-1px top-16 left-60 w-60 fixed">
              {TIMER_INTERVAL_KEYS.map((timerIntervalKey, index) => {
                return (
                  <MenuItem
                    key={index}
                    className="space-x-2"
                    onClick={() => dispatch(setTimerInterval(TimerInterval[timerIntervalKey]))}>
                    {() => (
                      <>
                        {timerInterval === TimerInterval[timerIntervalKey] ? (
                          <CheckMark />
                        ) : (
                          <span className="w-4" />
                        )}
                        <span>{timerIntervalKey}</span>
                      </>
                    )}
                  </MenuItem>
                )
              })}
            </div>
          ) : null}
        </>
      )}
    </MenuItem>
  )
}

const ConfigurationMenu = (): JSX.Element => {
  const [isOpen, toggleOpen] = useReducer((state: boolean) => !state, false)
  const [clickRef, isClicked] = useOutsideClick<HTMLDivElement>()

  if (isOpen && isClicked) {
    toggleOpen()
  }

  return (
    <div
      ref={clickRef}
      className={`cursor-pointer flex py-1 px-2 items-center hover:bg-gray-200 ${
        isOpen ? 'bg-gray-200' : ''
      }`}
      onClick={toggleOpen}>
      <div className="flex space-x-2 items-center">
        <Wrench />
        <span>Configuration</span>
      </div>
      {isOpen ? (
        <div className="divide-y border bg-gray-50 shadow top-8 left-0 w-60 fixed">
          <ClockSpeedMenu />
          <TimerIntervalMenu />
        </div>
      ) : null}
    </div>
  )
}

export default ConfigurationMenu
