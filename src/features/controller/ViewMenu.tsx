import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { View, CheckMark } from '../../common/components/icons'
import { useSelector, useDispatch } from '../../app/hooks'
import { MemoryView, selectMemoryView, setMemoryView } from './controllerSlice'

const MemoryMenu = (): JSX.Element => {
  const memoryView = useSelector(selectMemoryView)
  const dispatch = useDispatch()

  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Memory</span>
          </MenuButton>
          {isHovered && (
            <MenuItems.Expanded className="top-8" innerRef={menuItemsRef}>
              {Object.values(MemoryView).map((memoryViewOption, index) => (
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

const ViewMenu = (): JSX.Element => (
  <Menu>
    {isOpen => (
      <>
        <MenuButton.Main>
          <View />
          <span>View</span>
        </MenuButton.Main>
        {isOpen && (
          <MenuItems>
            <MemoryMenu />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default ViewMenu
