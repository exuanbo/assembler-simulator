import React from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import { File } from '../../common/components/icons'

const FileMenu = (): JSX.Element => (
  <Menu>
    {isOpen => (
      <>
        <MenuButton.Main>
          <File />
          <span>File</span>
        </MenuButton.Main>
      </>
    )}
  </Menu>
)

export default FileMenu
