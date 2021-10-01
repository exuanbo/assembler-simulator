import React from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File } from '../../common/components/icons'

const FileMenu = (): JSX.Element => (
  <Menu>
    {isOpen => (
      <>
        <MenuButton.Main>
          <File />
          <span>File</span>
        </MenuButton.Main>
        {isOpen ? (
          <MenuItems>
            <MenuItem>
              <span className="w-4" />
              <span>Foo</span>
            </MenuItem>
            <MenuItem>
              <span className="w-4" />
              <span>Bar</span>
            </MenuItem>
          </MenuItems>
        ) : null}
      </>
    )}
  </Menu>
)

export default FileMenu
