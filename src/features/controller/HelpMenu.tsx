import Menu from './Menu'
import MenuButton from './MenuButton'
import MenuItems from './MenuItems'
import MenuItem from './MenuItem'
import { Help } from '@/common/components/icons'

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

const HelpMenu = (): JSX.Element => (
  <Menu>
    {isOpen => (
      <>
        <MenuButton.Main>
          <Help />
        </MenuButton.Main>
        {isOpen && (
          <MenuItems>
            <InstructionSetButton />
            <BugReportButton />
          </MenuItems>
        )}
      </>
    )}
  </Menu>
)

export default HelpMenu
