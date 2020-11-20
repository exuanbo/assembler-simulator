import { FunctionalComponent, h } from 'preact'
import { usePrecoilState } from 'precoil'
import { Card } from 'antd'
import { labelState, statementState } from './app'

const Log: FunctionalComponent = () => {
  const [lables] = usePrecoilState(labelState)
  const labelTuple = Object.entries(lables)
  const [statements] = usePrecoilState(statementState)

  return (
    <Card title="Log">
      <Card type="inner" title="Statements">
        {statements.length > 0
          ? statements.map((statement, index) => (
              <div key={index}>
                {statement.key} {statement.args?.join(', ')}
              </div>
            ))
          : null}
      </Card>
      <Card type="inner" title="Labels">
        {labelTuple.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Index</th>
              </tr>
            </thead>
            <tbody>
              {labelTuple.map(([name, pos]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="label-index">{pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <style jsx>{`
          .label-index {
            text-align: center;
          }
        `}</style>
      </Card>
    </Card>
  )
}

export default Log
