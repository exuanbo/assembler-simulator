import type { FC } from 'react'

import Anchor from '@/common/components/Anchor'
import { Help } from '@/common/components/icons'
import Modal from '@/common/components/Modal'
import { useOutsideClick, useToggle } from '@/common/hooks'

import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItem from './MenuItem'
import MenuItems from './MenuItems'

interface ExternalLinkButtonProps {
  href: string
  name: string
}

const ExternalLinkButton: FC<ExternalLinkButtonProps> = ({ href, name }) => (
  <MenuItem.ExternalLink href={href}>
    <MenuButton>
      <span className="w-4" />
      <span>{name}</span>
    </MenuButton>
  </MenuItem.ExternalLink>
)

const InstructionSetButton: FC = () => (
  <ExternalLinkButton
    href="https://nbest.co.uk/Softwareforeducation/sms32v50/sms32v50_manual/250-FullIset.htm"
    name="Instruction Set"
  />
)

const ReportIssueButton: FC = () => (
  <ExternalLinkButton
    href="https://github.com/exuanbo/assembler-simulator/issues"
    name="Report Issue"
  />
)

const DiscussionsButton: FC = () => (
  <ExternalLinkButton
    href="https://github.com/exuanbo/assembler-simulator/discussions"
    name="Discussions"
  />
)

interface AboutButtonProps {
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const AboutButton: FC<AboutButtonProps> = ({ onClick }) => (
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

const AboutModal: FC<AboutModalProps> = ({ isOpen, toggleOpen }) => {
  const outsideClickRef = useOutsideClick(toggleOpen)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation()
  }

  return (
    <Modal className="bg-black bg-opacity-20" isOpen={isOpen}>
      <div
        ref={outsideClickRef}
        className="rounded space-y-2 bg-light-100 shadow text-center py-4 px-8 select-text all:select-text"
        onClick={handleClick}>
        <img alt="icon" className="mx-auto" height="72" src="./pwa-192x192.png" width="72" />
        <div className="font-bold">Assembler Simulator</div>
        <div className="space-y-4 text-sm">
          <div>
            <div>
              Version:{' '}
              <Anchor href="https://github.com/exuanbo/assembler-simulator/releases">
                {__VERSION__}
              </Anchor>
            </div>
            <div>
              Commit:{' '}
              <Anchor
                href={`https://github.com/exuanbo/assembler-simulator/commits/${__COMMIT_HASH__}`}>
                {__COMMIT_HASH__}
              </Anchor>
            </div>
            <div>Date: {__COMMIT_DATE__}</div>
          </div>
          <div>
            <Anchor href="https://github.com/exuanbo/assembler-simulator/blob/main/LICENSE">
              GPL-3.0 License
            </Anchor>{' '}
            <span className="font-sans">©</span> 2022-Present{' '}
            <Anchor href="https://github.com/exuanbo">Exuanbo</Anchor>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const HelpMenu: FC = () => {
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
              <ReportIssueButton />
              <DiscussionsButton />
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
