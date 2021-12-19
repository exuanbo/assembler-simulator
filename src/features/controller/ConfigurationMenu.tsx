import React from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { CheckMark, Wrench } from '../../common/components/icons'
import { useSelector, useDispatch } from '../../app/hooks'
import {
  ClockSpeed,
  CLOCK_SPEED_OPTION_NAMES,
  TimerInterval,
  TIMER_INTERVAL_OPTION_NAMES,
  selectAutoAssemble,
  selectClockSpeed,
  selectTimerInterval,
  setAutoAssemble,
  setClockSpeed,
  setTimerInterval
} from './controllerSlice'

const ConfigurationMenu = (): JSX.Element => {
  const dispatch = useDispatch()

  const AutoAssemble = (): JSX.Element => {
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
    const clockSpeed = useSelector(selectClockSpeed)

    return (
      <MenuItem.Expandable>
        {(isHovered, menuItemsRef) => (
          <>
            <MenuButton>
              <span className="w-4" />
              <span>Clock Speed</span>
            </MenuButton>
            {isHovered && (
              <MenuItems.Expanded className="mt-1px top-16" innerRef={menuItemsRef}>
                {CLOCK_SPEED_OPTION_NAMES.map((clockSpeedOptionName, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      dispatch(setClockSpeed(ClockSpeed[clockSpeedOptionName]))
                    }}>
                    <MenuButton>
                      {clockSpeed === ClockSpeed[clockSpeedOptionName] ? (
                        <CheckMark />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span>{clockSpeedOptionName}</span>
                    </MenuButton>
                  </MenuItem>
                ))}
              </MenuItems.Expanded>
            )}
          </>
        )}
      </MenuItem.Expandable>
    )
  }

  const TimerIntervalMenu = (): JSX.Element => {
    const timerInterval = useSelector(selectTimerInterval)

    return (
      <MenuItem.Expandable>
        {(isHovered, menuItemsRef) => (
          <>
            <MenuButton>
              <span className="w-4" />
              <span>Timer Interval</span>
            </MenuButton>
            {isHovered && (
              <MenuItems.Expanded className="mt-2px top-24" innerRef={menuItemsRef}>
                {TIMER_INTERVAL_OPTION_NAMES.map((timerIntervalOptionName, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      dispatch(setTimerInterval(TimerInterval[timerIntervalOptionName]))
                    }}>
                    <MenuButton>
                      {timerInterval === TimerInterval[timerIntervalOptionName] ? (
                        <CheckMark />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span>{timerIntervalOptionName}</span>
                    </MenuButton>
                  </MenuItem>
                ))}
              </MenuItems.Expanded>
            )}
          </>
        )}
      </MenuItem.Expandable>
    )
  }

  return (
    <Menu>
      {isOpen => (
        <>
          <MenuButton.Main>
            <Wrench />
            <span>Configuration</span>
          </MenuButton.Main>
          {isOpen && (
            <MenuItems>
              <AutoAssemble />
              <ClockSpeedMenu />
              <TimerIntervalMenu />
            </MenuItems>
          )}
        </>
      )}
    </Menu>
  )
}

export default ConfigurationMenu
