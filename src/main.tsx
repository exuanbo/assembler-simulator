import { registerSW } from 'virtual:pwa-register'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'virtual:windi.css'
import './styles.css'
import store from './app/store'
import App from './app/App'

registerSW({ immediate: true })

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('app-root')
)
