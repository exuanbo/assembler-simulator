import React, { useState } from 'react'
import Card from './Card'
import { EyeOpen, EyeClose } from './Icons'
import { tokenState } from '../atoms'
import { decToHex } from '../core/utils'

const Tokens: React.FC = () => {
  const [show, setShow] = useState(true)
  const [{ statements, labels }] = tokenState.useState()

  return (
    <Card
      Icon={() =>
        show ? <EyeClose className="h-4" /> : <EyeOpen className="h-4" />
      }
      title="Tokens"
      onIconClick={() => {
        setShow(!show)
      }}>
      {show ? (
        <div className="flex divide-x">
          <Card className="flex-1" title="Statements">
            <div className="px-3 py-1 border-b">
              {statements.length > 0 ? (
                <table className="w-full text-sm leading-narrow">
                  <thead>
                    <tr className="text-left">
                      <th>Instruction</th>
                      <th>Operand</th>
                      <th>Operand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statements.map((statement, statementIndex) => (
                      <tr key={`statement-${statementIndex}`}>
                        <td>{statement.instruction}</td>
                        {statement.operands?.map((operand, operandIndex) => (
                          <td
                            key={`statement-${statementIndex}-operand-${operandIndex}`}
                            className="font-mono">
                            {operand}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </Card>
          <Card className="flex-1" title="Labels">
            <div className="px-3 py-1 border-b">
              {labels.length > 0 ? (
                <table className="w-full text-sm leading-narrow">
                  <thead>
                    <tr className="text-left">
                      <th>Name</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels.map((label, labelIndex) => (
                      <tr key={`label-${labelIndex}`}>
                        <td>{label.name}</td>
                        <td className="font-mono">{decToHex(label.address)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}
    </Card>
  )
}

export default Tokens
