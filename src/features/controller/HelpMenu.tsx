import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import Modal from '@/common/components/Modal'
import Anchor from '@/common/components/Anchor'
import { Help, Close } from '@/common/components/icons'
import { useToggle, useOutsideClick } from '@/common/hooks'

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

interface AboutButtonProps {
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const AboutButton = ({ onClick }: AboutButtonProps): JSX.Element => (
  <MenuItem onClick={onClick}>
    <MenuButton>
      <span className="w-4" />
      <span>About</span>
    </MenuButton>
  </MenuItem>
)

interface AboutModalProps {
  isOpen: boolean
  toggleOpen: () => void
}

const AboutModal = ({ isOpen, toggleOpen }: AboutModalProps): JSX.Element => {
  const outsideClickRef = useOutsideClick(toggleOpen)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.stopPropagation()
  }

  return (
    <Modal
      className="bg-black flex bg-opacity-20 inset-0 fixed items-center justify-center"
      isOpen={isOpen}>
      <div
        ref={outsideClickRef}
        className="rounded bg-light-100 shadow text-center select-text all:select-text"
        onClick={handleClick}>
        <span
          className="rounded-full flex ml-auto bg-gray-200 h-4 top-4 right-4 w-4 relative justify-center group"
          onClick={toggleOpen}>
          <Close className="fill-none w-2 group-hover:fill-gray-400" />
        </span>
        <div className="space-y-2 px-8 pb-4">
          <img alt="icon" className="mx-auto" height="72" src="./pwa-192x192.png" width="72" />
          <div className="font-bold">Assembler Simulator</div>
          <div className="space-y-4 text-sm">
            <div>
              <div>Version {__VERSION__}</div>
              <div>
                Build{' '}
                <Anchor
                  href={`https://github.com/exuanbo/assembler-simulator/commits/${__COMMIT_HASH__}`}>
                  {__COMMIT_HASH__}
                </Anchor>
              </div>
            </div>
            <div>
              <Anchor href="https://github.com/exuanbo/assembler-simulator/blob/main/LICENSE">
                GPL-3.0 License
              </Anchor>{' '}
              <span className="font-sans">©</span> 2022{' '}
              <Anchor href="https://github.com/exuanbo">Exuanbo</Anchor>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const HelpMenu = (): JSX.Element => {
  const [isAboutModalOpen, toggleAboutModalOpen] = useToggle(false)

  return (
    <Menu>
      {(isOpen, hoverRef, menuElement) => (
        <>
          <MenuButton.Main innerRef={hoverRef}>
            <Help />
          </MenuButton.Main>
          {isOpen && (
            <MenuItems menuElement={menuElement}>
              <InstructionSetButton />
              <BugReportButton />
              <AboutButton onClick={toggleAboutModalOpen} />
            </MenuItems>
          )}
          <AboutModal isOpen={isAboutModalOpen} toggleOpen={toggleAboutModalOpen} />
        </>
      )}
    </Menu>
  )
}

export default HelpMenu
