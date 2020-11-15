import { FunctionalComponent, h } from 'preact'
import { Card } from 'antd'
import 'antd/es/card/style'
import { Label } from '../utils/tokenize'

interface Props {
  value: Label
}

const Lables: FunctionalComponent<Props> = ({ value }: Props) => {
  const labelTuple = Object.entries(value)
  return (
    <Card type="inner" title="Lables">
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
