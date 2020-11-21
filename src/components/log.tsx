import { FunctionalComponent, h } from 'preact'
import { usePrecoilState } from 'precoil'
import { labelState, statementState } from './app'
import Card from './card'
import { decToHex } from '../utils/helper'

const Log: FunctionalComponent = () => {
  const [labelTuple] = usePrecoilState(labelState)
  const [statements] = usePrecoilState(statementState)

  return (
    <Card title="Log">
      <Card title="Statements">
        {statements.length > 0 ? (
          <table className="table is-striped is-narrow">
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
      <Card title="Labels">
        {labelTuple.length > 0 ? (
          <table className="table is-striped is-narrow">
            <thead>
              <tr>
                <th>Name</th>
                <th>Addr</th>
              </tr>
            </thead>
            <tbody>
              {labelTuple.map(([name, address]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{decToHex(address)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Card>
      <style jsx>{`
        table td {
          text-align: center;
        }
      `}</style>
    </Card>
  )
}

export default Log
