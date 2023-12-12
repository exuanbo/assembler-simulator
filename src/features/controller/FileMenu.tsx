import { useRef, useState } from 'react'

import { applySelector, store } from '@/app/store'
import { File as FileIcon } from '@/common/components/icons'
import Modal from '@/common/components/Modal'
import { invariant } from '@/common/utils'
import { selectEditorInput, setEditorInput } from '@/features/editor/editorSlice'
import { examples, template } from '@/features/editor/examples'

import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItem from './MenuItem'
import MenuItems from './MenuItems'

const NewFileButton = (): JSX.Element => (
  <MenuItem
    onClick={() => {
      store.dispatch(
        setEditorInput({
          value: template.content,
          isFromFile: true,
        }),
      )
    }}>
    <MenuButton>
      <span className="w-4" />
      <span>New File</span>
    </MenuButton>
  </MenuItem>
)

interface OpenButtonProps {
  onFileLoad: () => void
}

const OpenButton = ({ onFileLoad }: OpenButtonProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation()
    inputRef.current!.click()
  }

  const handleClickInput: React.MouseEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation()
  }

  const loadFile = (file: File): void => {
    const reader = Object.assign(new FileReader(), {
      onload: () => {
        invariant(typeof reader.result === 'string')
        store.dispatch(
          setEditorInput({
            value: reader.result,
            isFromFile: true,
          }),
        )
      },
    })
    reader.readAsText(file)
  }

  const handleSelectFile: React.ChangeEventHandler<HTMLInputElement> = (event) => {
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
                  store.dispatch(
                    setEditorInput({
                      value: content,
                      isFromFile: true,
                    }),
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
  const handleClick = (): void => {
    const editorInput = applySelector(selectEditorInput)
    const fileBlob = new Blob([editorInput], { type: 'application/octet-stream' })
    const fileUrl = URL.createObjectURL(fileBlob)
    const anchorElement = Object.assign(document.createElement('a'), {
      download: 'file.asm',
      href: fileUrl,
    })
    anchorElement.click()
    URL.revokeObjectURL(fileUrl)
  }

  return (
    <MenuItem onClick={handleClick}>
      <MenuButton>
        <span className="w-4" />
        <span>Save As...</span>
      </MenuButton>
    </MenuItem>
  )
}

const ERROR_DURATION_MS = 2000

const CopyLinkButton = (): JSX.Element => {
  const [shouldShowError, setShouldShowError] = useState(false)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    navigator.clipboard.writeText(window.location.href).catch(() => {
      event.stopPropagation()
      setShouldShowError(true)
      window.setTimeout(() => {
        setShouldShowError(false)
      }, ERROR_DURATION_MS)
    })
  }

  return (
    <>
      <MenuItem onClick={handleClick}>
        <MenuButton>
          <span className="w-4" />
          <span>Copy Link</span>
        </MenuButton>
      </MenuItem>
      <Modal
        className="bg-white flex bg-opacity-80 inset-0 fixed items-center justify-center"
        isOpen={shouldShowError}>
        <div className="border rounded bg-light-100 shadow py-2 px-4">Copy Failed</div>
      </Modal>
    </>
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
            <CopyLinkButton />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default FileMenu
