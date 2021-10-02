import React from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { CheckMark, Wrench } from '../../common/components/icons'
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
      onClick={() => {
        dispatch(setAutoAssemble(!autoAssemble))
      }}>
      <MenuButton>
        {autoAssemble ? <CheckMark /> : <span className="w-4" />}
        <span>Auto Assemble</span>
      </MenuButton>
    </MenuItem>
  )
}

const ClockSpeedMenu = (): JSX.Element => {
  const dispatch = useDispatch()
  const clockSpeed = useSelector(selectClockSpeed)

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Clock Speed</span>
          </MenuButton>
          {isHovered ? (
            <MenuItems.Expanded className="mt-1px top-16" innerRef={menuItemsRef}>
              {CLOCK_SPEED_KEYS.map((clockSpeedKey, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    dispatch(setClockSpeed(ClockSpeed[clockSpeedKey]))
                  }}>
                  <MenuButton>
                    {clockSpeed === ClockSpeed[clockSpeedKey] ? (
                      <CheckMark />
                    ) : (
                      <span className="w-4" />
                    )}
                    <span>{clockSpeedKey}</span>
                  </MenuButton>
                </MenuItem>
              ))}
            </MenuItems.Expanded>
          ) : null}
        </>
      )}
    </MenuItem.Expandable>
  )
}

const TimerIntervalMenu = (): JSX.Element => {
  const dispatch = useDispatch()
  const timerInterval = useSelector(selectTimerInterval)

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Timer Interval</span>
          </MenuButton>
          {isHovered ? (
            <MenuItems.Expanded className="mt-2px top-24" innerRef={menuItemsRef}>
              {TIMER_INTERVAL_KEYS.map((timerIntervalKey, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    dispatch(setTimerInterval(TimerInterval[timerIntervalKey]))
                  }}>
                  <MenuButton>
                    {timerInterval === TimerInterval[timerIntervalKey] ? (
                      <CheckMark />
                    ) : (
                      <span className="w-4" />
                    )}
                    <span>{timerIntervalKey}</span>
                  </MenuButton>
                </MenuItem>
              ))}
            </MenuItems.Expanded>
          ) : null}
        </>
      )}
    </MenuItem.Expandable>
  )
}

const ConfigurationMenu = (): JSX.Element => (
  <Menu>
    {isOpen => (
      <>
        <MenuButton.Main>
          <Wrench />
          <span>Configuration</span>
        </MenuButton.Main>
        {isOpen ? (
          <MenuItems>
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
