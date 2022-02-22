import { createContext, useContext, useCallback, useMemo } from 'react'
import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import Modal from '@/common/components/Modal'
import { Help } from '@/common/components/icons'
import { useToggle, useOutsideClick } from '@/common/hooks'
import { noop } from '@/common/utils'

const InstructionSetButton = (): JSX.Element => (
  <MenuItem.ExternalLink href="http://www.softwareforeducation.com/sms32v50/sms32v50_manual/250-FullIset.htm">
    <MenuButton>
      <span className="w-4" />
      <span>Instruction Set</span>
    </MenuButton>
  </MenuItem.ExternalLink>
)

const BugReportButton = (): JSX.Element => (
  <MenuItem.ExternalLink href="https://github.com/exuanbo/assembler-simulator/issues">
    <MenuButton>
      <span className="w-4" />
      <span>Bug Report</span>
    </MenuButton>
  </MenuItem.ExternalLink>
)

interface AboutModalContextValue {
  isOpen: boolean
  toggleOpen: () => void
}

const AboutModalContext = createContext<AboutModalContextValue>({
  isOpen: false,
  toggleOpen: noop
})
if (import.meta.env.DEV) {
  AboutModalContext.displayName = 'AboutModalContext'
}

const AboutButton = (): JSX.Element => {
  const { isOpen, toggleOpen } = useContext(AboutModalContext)

  const handleClick = (): void => {
    if (!isOpen) {
      toggleOpen()
    }
  }

  return (
    <MenuItem onClick={handleClick}>
      <MenuButton>
        <span className="w-4" />
        <span>About</span>
      </MenuButton>
    </MenuItem>
  )
}

const AboutModal = (): JSX.Element => {
  const { isOpen, toggleOpen } = useContext(AboutModalContext)

  const handleOutsideClick = useCallback(() => {
    if (isOpen) {
      toggleOpen()
    }
  }, [isOpen])

  const outsideClickRef = useOutsideClick(handleOutsideClick)

  return (
    <Modal isOpen={isOpen}>
      <div className="flex inset-0 fixed items-center justify-center">
        <div ref={outsideClickRef} className="bg-white">
          About
        </div>
      </div>
    </Modal>
  )
}

const HelpMenu = (): JSX.Element => {
  const [isAboutModalOpen, toggleAboutModalOpen] = useToggle(false)

  const aboutModalContextValue = useMemo(() => {
    return {
      isOpen: isAboutModalOpen,
      toggleOpen: toggleAboutModalOpen
    }
  }, [isAboutModalOpen])

  return (
    <Menu>
      {(isOpen, hoverRef, menuElement) => (
        <>
          <MenuButton.Main innerRef={hoverRef}>
            <Help />
          </MenuButton.Main>
          <AboutModalContext.Provider value={aboutModalContextValue}>
            {isOpen && (
              <MenuItems menuElement={menuElement}>
                <InstructionSetButton />
                <BugReportButton />
                <AboutButton />
              </MenuItems>
            )}
            <AboutModal />
          </AboutModalContext.Provider>
        </>
      )}
    </Menu>
  )
}

export default HelpMenu
