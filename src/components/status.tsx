import { Fragment, FunctionalComponent, h } from 'preact'
import { usePrecoilState } from 'precoil'
import { errorState } from './app'

const Status: FunctionalComponent = () => {
  const [error] = usePrecoilState(errorState)

  return (
    <>
      <div
        className={`has-text-white-bis ${
          error === null ? 'has-background-success' : 'has-background-danger'
        }`}>
        {error === null ? 'Looks good so far :D' : status}
      </div>
      <style jsx>{`
        div {
          width: 100%;
          padding: 0.075rem 0.875rem 0.175rem 0.875rem;
          border-radius: 0 0 4px 4px;
        }
      `}</style>
    </>
  )
}

export default Status
