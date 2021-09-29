import React from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { CheckMark, Wrench, Play } from '../../common/components/icons'
import { useSelector, useDispatch } from '../../app/hooks'
import {
  ClockSpeed,
  CLOCK_SPEED_KEYS,
  TimerInterval,
  TIMER_INTERVAL_KEYS,
  setAutoAssemble,
  setClockSpeed,
  setTimerInterval,
  selectAutoAssemble,
  selectClockSpeed,
  selectTimerInterval
} from './controllerSlice'

const AutoAssembleOption = (): JSX.Element => {
  const dispatch = useDispatch()
  const autoAssemble = useSelector(selectAutoAssemble)

  return (
    <MenuItem
      className="space-x-2"
      onClick={() => {
        dispatch(setAutoAssemble(!autoAssemble))
      }}>
      {() => (
        <>
          {autoAssemble ? <CheckMark /> : <span className="w-4" />}
          <span>Auto Assemble</span>
        </>
      )}
    </MenuItem>
  )
}

const ClockSpeedMenu = (): JSX.Element => {
  const dispatch = useDispatch()
  const clockSpeed = useSelector(selectClockSpeed)

  return (
    <MenuItem.SubMenu>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Clock Speed</span>
          </MenuButton>
          <Play className="h-2.5" />
          {isHovered ? (
            <MenuItems className="top-8 left-60 w-60" innerRef={menuItemsRef}>
              {CLOCK_SPEED_KEYS.map((clockSpeedKey, index) => (
                <MenuItem
                  key={index}
                  className="space-x-2"
                  onClick={() => {
                    dispatch(setClockSpeed(ClockSpeed[clockSpeedKey]))
                  }}>
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
              ))}
            </MenuItems>
          ) : null}
        </>
      )}
    </MenuItem.SubMenu>
  )
}

const TimerIntervalMenu = (): JSX.Element => {
  const dispatch = useDispatch()
  const timerInterval = useSelector(selectTimerInterval)

  return (
    <MenuItem.SubMenu>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Timer Interval</span>
          </MenuButton>
          <Play className="h-2.5" />
          {isHovered ? (
            <MenuItems className="mt-1px top-16 left-60 w-60" innerRef={menuItemsRef}>
              {TIMER_INTERVAL_KEYS.map((timerIntervalKey, index) => (
                <MenuItem
                  key={index}
                  className="space-x-2"
                  onClick={() => {
                    dispatch(setTimerInterval(TimerInterval[timerIntervalKey]))
                  }}>
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
              ))}
            </MenuItems>
          ) : null}
        </>
      )}
    </MenuItem.SubMenu>
  )
}

const ConfigurationMenu = (): JSX.Element => (
  <Menu>
    {isOpen => (
      <>
        <MenuButton>
          <Wrench />
          <span>Configuration</span>
        </MenuButton>
        {isOpen ? (
          <MenuItems className="top-8 left-0 w-60">
            <AutoAssembleOption />
            <ClockSpeedMenu />
            <TimerIntervalMenu />
          </MenuItems>
        ) : null}
      </>
    )}
  </Menu>
)

export default ConfigurationMenu
