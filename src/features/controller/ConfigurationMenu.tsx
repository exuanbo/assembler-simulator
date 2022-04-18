import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { CheckMark, Wrench } from '@/common/components/icons'
import { useStore, useSelector } from '@/app/hooks'
import {
  ClockSpeed,
  clockSpeedOptionNames,
  TimerInterval,
  timerIntervalOptionNames,
  selectAutoAssemble,
  selectClockSpeed,
  selectTimerInterval,
  setAutoAssemble,
  setClockSpeed,
  setTimerInterval
} from './controllerSlice'

const AutoAssembleSwitch = (): JSX.Element => {
  const store = useStore()
  const autoAssemble = useSelector(selectAutoAssemble)

  const toggleAutoAssemble = (): void => {
    store.dispatch(setAutoAssemble(!autoAssemble))
  }

  return (
    <MenuItem onClick={toggleAutoAssemble}>
      <MenuButton>
        {autoAssemble ? <CheckMark /> : <span className="w-4" />}
        <span>Auto Assemble</span>
      </MenuButton>
    </MenuItem>
  )
}

const ClockSpeedMenu = (): JSX.Element => {
  const store = useStore()
  const clockSpeed = useSelector(selectClockSpeed)

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef, menuItemElement) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Clock Speed</span>
          </MenuButton>
          {isHovered && (
            <MenuItems.Expanded innerRef={menuItemsRef} menuItemElement={menuItemElement}>
              {clockSpeedOptionNames.map((clockSpeedOptionName, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    store.dispatch(setClockSpeed(ClockSpeed[clockSpeedOptionName]))
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
  const store = useStore()
  const timerInterval = useSelector(selectTimerInterval)

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef, menuItemElement) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Timer Interval</span>
          </MenuButton>
          {isHovered && (
            <MenuItems.Expanded innerRef={menuItemsRef} menuItemElement={menuItemElement}>
              {timerIntervalOptionNames.map((timerIntervalOptionName, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    store.dispatch(setTimerInterval(TimerInterval[timerIntervalOptionName]))
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

const ConfigurationMenu = (): JSX.Element => (
  <Menu>
    {(isOpen, hoverRef, menuElement) => (
      <>
        <MenuButton.Main innerRef={hoverRef}>
          <Wrench />
          <span>Configuration</span>
        </MenuButton.Main>
        {isOpen && (
          <MenuItems menuElement={menuElement}>
            <AutoAssembleSwitch />
            <ClockSpeedMenu />
            <TimerIntervalMenu />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default ConfigurationMenu
