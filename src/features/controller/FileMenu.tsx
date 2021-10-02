import React, { useRef } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File } from '../../common/components/icons'
import { useDispatch } from '../../app/hooks'
import { setEditorInput } from '../editor/editorSlice'

const FileMenu = (): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()

  const handleClickUpload = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
    inputRef.current?.click()
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
                <span className="w-4" />
                <span>Upload</span>
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
}

export default FileMenu
