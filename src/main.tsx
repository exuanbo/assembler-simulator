import React from 'react'
import ReactDOM from 'react-dom'
import 'virtual:windi.css'
import { Provider } from 'react-redux'
import store from './app/store'
import App from './app/App'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
