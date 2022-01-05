import React, { RefCallback, useRef } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { File as FileIcon } from '../../common/components/icons'
import type { Dispatch } from '../../app/store'
import { useDispatch, useStore } from '../../app/hooks'
import { setEditorInput, selectEditortInput } from '../editor/editorSlice'
import { samples } from '../editor/samples'

const Upload = ({ onFileUploaded }: { onFileUploaded: () => void }): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.stopPropagation()
    inputRef.current!.click()
  }

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = event => {
    event.stopPropagation()
  }

  const handleUploadedFile = (file: File): void => {
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

  const handleFileUploaded: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const file = target.files![0]
    handleUploadedFile(file)
    onFileUploaded()
  }

  return (
    <MenuItem onClick={handleClick}>
      <MenuButton>
        <span className="w-4" />
        <span>Upload</span>
      </MenuButton>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={handleFileUploaded}
        onClick={handleInputClick}
      />
    </MenuItem>
  )
}

const Download = (): JSX.Element => {
  const { getState } = useStore()

  const handleClickDownload: React.MouseEventHandler<HTMLDivElement> = () => {
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
    <MenuItem onClick={handleClickDownload}>
      <MenuButton>
        <span className="w-4" />
        <span>Download</span>
      </MenuButton>
    </MenuItem>
  )
}

const SampleItems = React.memo(
  ({
    dispatch,
    innerRef: menuItemsRef
  }: {
    dispatch: Dispatch
    innerRef: RefCallback<HTMLDivElement>
  }) => (
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
  )
)

const Samples = (): JSX.Element => {
  const dispatch = useDispatch()
  return (
    <MenuItem.Expandable>
      {(isHovered, menuItemsRef) => (
        <>
          <MenuButton>
            <span className="w-4" />
            <span>Samples</span>
          </MenuButton>
          {isHovered && <SampleItems dispatch={dispatch} innerRef={menuItemsRef} />}
        </>
      )}
    </MenuItem.Expandable>
  )
}

const FileMenu = (): JSX.Element => (
  <Menu>
    {(isOpen, toggleOpen) => (
      <>
        <MenuButton.Main>
          <FileIcon />
          <span>File</span>
        </MenuButton.Main>
        {isOpen && (
          <MenuItems>
            <Upload onFileUploaded={toggleOpen} />
            <Download />
            <Samples />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default FileMenu
