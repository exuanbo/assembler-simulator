import React, { useRef } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File } from '../../common/components/icons'
import { useStore } from '../../app/hooks'
import { setEditorInput, selectEditortInput } from '../editor/editorSlice'
import { samples } from '../editor/samples'

const FileMenu = (): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { getState, dispatch } = useStore()

  const handleClickUpload = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
    inputRef.current!.click()
  }

  const handleUploadedFile = (): void => {
    const file = inputRef.current!.files![0]
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

  interface Props {
    onInputChange: () => void
  }

  const Upload = ({ onInputChange }: Props): JSX.Element => (
    <MenuItem onClick={handleClickUpload}>
      <MenuButton>
        <span className="w-4" />
        <span>Upload</span>
      </MenuButton>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={() => {
          handleUploadedFile()
          onInputChange()
        }}
        onClick={event => {
          event.stopPropagation()
        }}
      />
    </MenuItem>
  )

  const handleClickDownload = (): void => {
    const editorInput = selectEditortInput(getState())
    const fileBlob = new Blob([editorInput], { type: 'application/octet-stream' })
    const fileUrl = URL.createObjectURL(fileBlob)
    const el = document.createElement('a')
    el.download = 'file.asm'
    el.href = fileUrl
    el.click()
    URL.revokeObjectURL(fileUrl)
  }

  const Download = (): JSX.Element => (
    <MenuItem onClick={handleClickDownload}>
      <MenuButton>
        <span className="w-4" />
        <span>Download</span>
      </MenuButton>
    </MenuItem>
  )

  const Samples = (): JSX.Element => (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Samples</span>
          </MenuButton>
          {isHovered ? (
            <MenuItems.Expanded className="mt-2px top-24" innerRef={menuItemsRef}>
              {samples.map(({ title, content }, index) => (
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
          ) : null}
        </>
      )}
    </MenuItem.Expandable>
  )

  return (
    <Menu>
      {(isOpen, toggleOpen) => (
        <>
          <MenuButton.Main>
            <File />
            <span>File</span>
          </MenuButton.Main>
          {isOpen ? (
            <MenuItems>
              <Upload onInputChange={toggleOpen} />
              <Download />
              <Samples />
            </MenuItems>
          ) : null}
        </>
      )}
    </Menu>
  )
}

export default FileMenu
