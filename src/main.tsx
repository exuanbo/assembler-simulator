import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'virtual:windi.css'
import './index.css'
import store from './app/store'
import { createWatch } from './app/watch'
import { selectStateToPersist } from './app/selectors'
import { saveState } from './app/localStorage'
import App from './app/App'

const watch = createWatch(store)

watch(selectStateToPersist, stateToPersist => {
  saveState(stateToPersist)
})

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
