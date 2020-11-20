import { FunctionalComponent, h } from 'preact'
import { usePrecoilState } from 'precoil'
import { Card } from 'antd'
import { labelsState } from './app'

const Lables: FunctionalComponent = () => {
  const [lables] = usePrecoilState(labelsState)

  const labelTuple = Object.entries(lables)
  return (
    <Card title="Lables">
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
                <td>{pos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Card>
  )
}

export default Lables
