import { FunctionalComponent, h } from 'preact'

const Headbar: FunctionalComponent = () => (
  <nav className="navbar block">
    <div className="navbar-brand">
      <h1 className="title" style={{ lineHeight: '2em' }}>
        Assembler Simulator
      </h1>
    </div>
    <div className="navbar-menu">
      <div className="navbar-item buttons">
        <button className="button">Run</button>
        <button className="button">Stop</button>
        <button className="button">Reset</button>
      </div>
    </div>
  </nav>
)

export default Headbar
