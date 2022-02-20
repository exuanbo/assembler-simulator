import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { CheckMark, View as ViewIcon } from '@/common/components/icons'
import { dispatch } from '@/app/store'
import { useSelector } from '@/app/hooks'
import { memoryViewOptions, selectMemoryView, setMemoryView } from '@/features/memory/memorySlice'
import { ioDeviceNames, selectIoDevices, toggleIoDeviceVisible } from '@/features/io/ioSlice'
import { splitCamelCaseToString } from '@/common/utils'

const MemoryMenu = (): JSX.Element => {
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
                    dispatch(setMemoryView(memoryViewOption))
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

const IoMenu = (): JSX.Element => {
  const ioDevices = useSelector(selectIoDevices)

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
                    dispatch(toggleIoDeviceVisible(name))
                  }}>
                  <MenuButton>
                    {ioDevices[name].isVisible ? <CheckMark /> : <span className="w-4" />}
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

const ViewMenu = (): JSX.Element => (
  <Menu>
    {(isOpen, hoverRef, menuElement) => (
      <>
        <MenuButton.Main innerRef={hoverRef}>
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
