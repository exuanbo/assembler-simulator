import React, { useRef } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File } from '../../common/components/icons'
import { useStore } from '../../app/hooks'
import { setEditorInput, selectEditortInput } from '../editor/editorSlice'

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
    reader.onload = () => {
      const fileContent = reader.result as string
      dispatch(
        setEditorInput({
          value: fileContent,
          isFromFile: true
        })
      )
    }
    reader.readAsText(file)
  }

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
                    toggleOpen()
                  }}
                  onClick={event => {
                    event.stopPropagation()
                  }}
                />
              </MenuItem>
              <MenuItem onClick={handleClickDownload}>
                <MenuButton>
                  <span className="w-4" />
                  <span>Download</span>
                </MenuButton>
              </MenuItem>
            </MenuItems>
          ) : null}
        </>
      )}
    </Menu>
  )
}

export default FileMenu
