import { FunctionalComponent, h } from 'preact'
import { useState } from 'preact/hooks'
import { usePrecoilState } from 'precoil'
import { tokenState } from './app'
import Card from './card'
import Eye from './icons/eye-solid'
import { decToHex } from '../utils'

const Tokens: FunctionalComponent = () => {
  const [tokens] = usePrecoilState(tokenState)
  const { statements, labelTuples } = tokens
  const [show, setShow] = useState(false)

  return (
    <Card Icon={Eye} title="Tokens" onIconClick={() => setShow(!show)}>
      {show ? (
        <div className="columns">
          <div className="column">
            <Card title="Statements">
              {statements.length > 0 ? (
                <table className="table is-striped is-narrow is-fullwidth">
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Arg1</th>
                      <th>Arg2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statements.map((statement, index) => (
                      <tr key={index}>
                        <td>{statement.key}</td>
                        <td>{statement.args?.[0] ?? null}</td>
                        <td>{statement.args?.[1] ?? null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </Card>
          </div>
          <div className="column">
            <Card className="colum" title="Labels">
              {labelTuples.length > 0 ? (
                <table className="table is-striped is-narrow is-fullwidth">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Addr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labelTuples.map(([name, address]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{decToHex(address)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}
    </Card>
  )
}

export default Tokens
