import { useRef } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File as FileIcon } from '@/common/components/icons'
import { getState, dispatch } from '@/app/store'
import { setEditorInput, selectEditorInput } from '@/features/editor/editorSlice'
import { examples } from '@/features/editor/examples'

const NewFileButton = (): JSX.Element => (
  <MenuItem
    onClick={() => {
      dispatch(
        setEditorInput({
          value: '',
          isFromFile: true
        })
      )
    }}>
    <MenuButton>
      <span className="w-4" />
      <span>New File</span>
    </MenuButton>
  </MenuItem>
)

const OpenButton = ({ onFileLoad }: { onFileLoad: () => void }): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.stopPropagation()
    inputRef.current!.click()
  }

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = event => {
    event.stopPropagation()
  }

  const loadFile = (file: File): void => {
    const reader = new FileReader()
    reader.onload = function () {
      const fileContent = this.result as string
      dispatch(
        setEditorInput({
          value: fileContent,
          isFromFile: true
        })
      )
    }
    reader.readAsText(file)
  }

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const file = target.files![0]
    loadFile(file)
    onFileLoad()
  }

  return (
    <MenuItem onClick={handleClick}>
      <MenuButton>
        <span className="w-4" />
        <span>Open...</span>
      </MenuButton>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={handleFileSelect}
        onClick={handleInputClick}
      />
    </MenuItem>
  )
}

const OpenExampleMenu = (): JSX.Element => (
  <MenuItem.Expandable>
    {(isHovered, menuItemsRef, menuItemElement) => (
      <>
        <MenuButton>
          <span className="w-4" />
          <span>Open Example</span>
        </MenuButton>
        {isHovered && (
          <MenuItems.Expanded innerRef={menuItemsRef} menuItemElement={menuItemElement}>
            {examples.map(({ title, content }, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  dispatch(
                    setEditorInput({
                      value: content,
                      isFromFile: true
                    })
                  )
                }}>
                <MenuButton>
                  <span className="w-4" />
                  <span>{title}</span>
                </MenuButton>
              </MenuItem>
            ))}
          </MenuItems.Expanded>
        )}
      </>
    )}
  </MenuItem.Expandable>
)

const SaveButton = (): JSX.Element => {
  const handleClickSave = (): void => {
    const editorInput = selectEditorInput(getState())
    const fileBlob = new Blob([editorInput], { type: 'application/octet-stream' })
    const fileUrl = URL.createObjectURL(fileBlob)
    const anchorElement = Object.assign(document.createElement('a'), {
      download: 'file.asm',
      href: fileUrl
    })
    anchorElement.click()
    URL.revokeObjectURL(fileUrl)
  }

  return (
    <MenuItem onClick={handleClickSave}>
      <MenuButton>
        <span className="w-4" />
        <span>Save As...</span>
      </MenuButton>
    </MenuItem>
  )
}

const FileMenu = (): JSX.Element => (
  <Menu>
    {(isOpen, hoverRef, menuElement) => (
      <>
        <MenuButton.Main innerRef={hoverRef}>
          <FileIcon />
          <span>File</span>
        </MenuButton.Main>
        {isOpen && (
          <MenuItems menuElement={menuElement}>
            <NewFileButton />
            <OpenButton onFileLoad={() => menuElement.click()} />
            <OpenExampleMenu />
            <SaveButton />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default FileMenu
