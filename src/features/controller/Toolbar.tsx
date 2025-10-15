import { type FC, useCallback, useMemo, useState } from 'react'

import Anchor from '@/common/components/Anchor'
import { Github } from '@/common/components/icons'
import { useOutsideClick, useStableHandler } from '@/common/hooks'

import ConfigurationMenu from './ConfigurationMenu'
import ControlButtons from './ControlButtons'
import FileMenu from './FileMenu'
import HelpMenu from './HelpMenu'
import { MenuContext } from './Menu'
import ViewMenu from './ViewMenu'

const ToolBar: FC = () => {
  const [openMenu, __setOpenMenu] = useState<HTMLDivElement | null>(null)

  const setOpenMenu = useStableHandler((element: HTMLDivElement | null) => {
    __setOpenMenu(element)
    // eslint-disable-next-line react-hooks/immutability
    outsideClickRef(element)
  })

  const menuContextValue = useMemo(() => {
    return {
      currentOpen: openMenu,
      setCurrentOpen: setOpenMenu,
    }
  }, [openMenu, setOpenMenu])

  const handleOutsideClick = useCallback(() => {
    setOpenMenu(null)
  }, [setOpenMenu])
  const outsideClickRef = useOutsideClick(handleOutsideClick)

  return (
    <header className="border-y flex flex-row-reverse min-w-max bg-gray-100 h-8 w-full z-10 fixed items-center justify-between">
      <div className="flex space-x-2 py-1 px-2 items-center">
        <h1>Assembler Simulator</h1>
        <Anchor href="https://github.com/exuanbo/assembler-simulator">
          <Github width="1.125rem" />
        </Anchor>
      </div>
      <div className="divide-x border-r flex">
        <MenuContext.Provider value={menuContextValue}>
          <FileMenu />
          <ViewMenu />
          <ConfigurationMenu />
          <ControlButtons />
          <HelpMenu />
        </MenuContext.Provider>
      </div>
    </header>
  )
}

export default ToolBar
