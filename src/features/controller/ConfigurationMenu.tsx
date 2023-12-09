import { store, useSelector } from '@/app/store'
import { CheckMark, Wrench } from '@/common/components/icons'

import {
  ClockSpeed,
  clockSpeedOptionNames,
  selectAutoAssemble,
  selectClockSpeed,
  selectTimerInterval,
  selectVimKeybindings,
  setAutoAssemble,
  setClockSpeed,
  setTimerInterval,
  setVimKeybindings,
  TimerInterval,
  timerIntervalOptionNames,
} from './controllerSlice'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItem from './MenuItem'
import MenuItems from './MenuItems'

const AutoAssembleSwitch = (): JSX.Element => {
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

const VimKeybindingsSwitch = (): JSX.Element => {
  const vimKeybindings = useSelector(selectVimKeybindings)

  const toggleVimKeybindings = (): void => {
    store.dispatch(setVimKeybindings(!vimKeybindings))
  }

  return (
    <MenuItem onClick={toggleVimKeybindings}>
      <MenuButton>
        {vimKeybindings ? <CheckMark /> : <span className="w-4" />}
        <span>Vim Keybindings</span>
      </MenuButton>
    </MenuItem>
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
            <VimKeybindingsSwitch />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default ConfigurationMenu
