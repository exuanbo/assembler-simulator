import React, { useState } from 'react'
import Card from './Card'
import { EyeOpen, EyeClose } from './Icons'
import { tokenState } from '../atoms'
import { decToHex } from '../core/utils'

const Tokens: React.FC = () => {
  const [show, setShow] = useState(true)
  const [tokens] = tokenState.useState()

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
              {tokens.statements.length > 0 ? (
                <table className="w-full text-sm leading-narrow">
                  <thead>
                    <tr className="text-left">
                      <th>Instruction</th>
                      <th>Arg1</th>
                      <th>Arg2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.statements.map((statement, statementIndex) => (
                      <tr key={`statement-${statementIndex}`}>
                        <td>{statement.instruction}</td>
                        {statement.args?.map((arg, argIndex) => (
                          <td
                            key={`statement-${statementIndex}-arg-${argIndex}`}
                            className="font-mono">
                            {arg}
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
              {tokens.labelTuples.length > 0 ? (
                <table className="w-full text-sm leading-narrow">
                  <thead>
                    <tr className="text-left">
                      <th>Name</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.labelTuples.map(([name, address]) => (
                      <tr key={`label-${name}`}>
                        <td>{name}</td>
                        <td className="font-mono">{decToHex(address)}</td>
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
