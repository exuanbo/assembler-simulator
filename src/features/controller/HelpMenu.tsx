import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import Modal from '@/common/components/Modal'
import Link from '@/common/components/Link'
import { Help } from '@/common/components/icons'
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
        className="rounded space-y-2 bg-light-100 shadow text-center py-4 px-8 select-text all:select-text"
        onClick={handleClick}>
        <img alt="icon" className="mx-auto" src="./pwa-192x192.png" width="72" />
        <div className="font-bold">Assembler Simulator</div>
        <div className="space-y-4 text-sm">
          <div>
            <div>Version {__VERSION__}</div>
            <div>
              Build{' '}
              <Link
                external
                href={`https://github.com/exuanbo/assembler-simulator/commits/${__COMMIT_HASH__}`}>
                {__COMMIT_HASH__}
              </Link>
            </div>
          </div>
          <div>
            <Link external href="https://github.com/exuanbo/assembler-simulator/blob/main/LICENSE">
              GPL-3.0 License
            </Link>{' '}
            <span className="font-sans">©</span> 2022{' '}
            <Link external href="https://github.com/exuanbo">
              Exuanbo
            </Link>
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
