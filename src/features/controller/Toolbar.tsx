import MenuButton from './MenuButton'
import FileMenu from './FileMenu'
import ViewMenu from './ViewMenu'
import ConfigurationMenu from './ConfigurationMenu'
import ControlButtons from './ControlButtons'
import { Github } from '@/common/components/icons'

const ToolBar = (): JSX.Element => (
  <div className="border-t border-b flex flex-row-reverse min-w-max bg-gray-100 h-8 w-full z-10 fixed items-center justify-between">
    <MenuButton.Main>
      <h1>Assembler Simulator</h1>
      <a
        href="https://github.com/exuanbo/assembler-simulator"
        rel="noopener noreferrer"
        target="_blank">
        <Github className="w-4.5" />
      </a>
    </MenuButton.Main>
    <div className="divide-x flex">
      <FileMenu />
      <ViewMenu />
      <ConfigurationMenu />
      <ControlButtons />
    </div>
  </div>
)

export default ToolBar
