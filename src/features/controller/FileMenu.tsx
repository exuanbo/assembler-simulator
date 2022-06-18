import { useRef } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File as FileIcon } from '@/common/components/icons'
import { useStore } from '@/app/hooks'
import { setEditorInput, selectEditorInput } from '@/features/editor/editorSlice'
import { template, examples } from '@/features/editor/examples'

const NewFileButton = (): JSX.Element => {
  const store = useStore()

  return (
    <MenuItem
      onClick={() => {
        store.dispatch(
          setEditorInput({
            value: template.content,
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
}

interface OpenButtonProps {
  onFileLoad: () => void
}

const OpenButton = ({ onFileLoad }: OpenButtonProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.stopPropagation()
    inputRef.current!.click()
  }

  const handleClickInput: React.MouseEventHandler<HTMLInputElement> = event => {
    event.stopPropagation()
  }

  const store = useStore()

  const loadFile = (file: File): void => {
    const reader = new FileReader()
    reader.onload = function () {
      const fileContent = this.result as string
      store.dispatch(
        setEditorInput({
          value: fileContent,
          isFromFile: true
        })
      )
    }
    reader.readAsText(file)
  }

  const handleSelectFile: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files![0]
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
        onChange={handleSelectFile}
        onClick={handleClickInput}
      />
    </MenuItem>
  )
}

const OpenExampleMenu = (): JSX.Element => {
  const store = useStore()

  return (
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
                    store.dispatch(
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
}

const SaveButton = (): JSX.Element => {
  const store = useStore()

  const handleClickSave = (): void => {
    const editorInput = selectEditorInput(store.getState())
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
