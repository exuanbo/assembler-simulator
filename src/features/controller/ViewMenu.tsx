import type { FC } from 'react'

import { store, useSelector } from '@/app/store'
import { CheckMark, View as ViewIcon } from '@/common/components/icons'
import { splitCamelCaseToString } from '@/common/utils'
import { ioDeviceNames, selectIoDeviceStates, toggleIoDeviceVisible } from '@/features/io/ioSlice'
import { memoryViewOptions, selectMemoryView, setMemoryView } from '@/features/memory/memorySlice'

import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItem from './MenuItem'
import MenuItems from './MenuItems'

const MemoryMenu: FC = () => {
  const memoryView = useSelector(selectMemoryView)

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef, menuItemElement) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Memory</span>
          </MenuButton>
          {isHovered && (
            <MenuItems.Expanded innerRef={menuItemsRef} menuItemElement={menuItemElement}>
              {memoryViewOptions.map((memoryViewOption, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    store.dispatch(setMemoryView(memoryViewOption))
                  }}>
                  <MenuButton>
                    {memoryView === memoryViewOption ? <CheckMark /> : <span className="w-4" />}
                    <span>{memoryViewOption}</span>
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

const IoMenu: FC = () => {
  const ioDeviceStates = useSelector(selectIoDeviceStates)

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef, menuItemElement) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>I/O Devices</span>
          </MenuButton>
          {isHovered && (
            <MenuItems.Expanded innerRef={menuItemsRef} menuItemElement={menuItemElement}>
              {ioDeviceNames.map((name, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    store.dispatch(toggleIoDeviceVisible(name))
                  }}>
                  <MenuButton>
                    {ioDeviceStates[name].isVisible ? <CheckMark /> : <span className="w-4" />}
                    <span>{splitCamelCaseToString(name)}</span>
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

const ViewMenu: FC = () => (
  <Menu>
    {(isOpen, hoverRef, menuElement) => (
      <>
        <MenuButton.Main ref={hoverRef}>
          <ViewIcon />
          <span>View</span>
        </MenuButton.Main>
        {isOpen && (
          <MenuItems menuElement={menuElement}>
            <MemoryMenu />
            <IoMenu />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default ViewMenu
