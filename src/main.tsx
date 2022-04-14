import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import 'virtual:windi.css'
import './styles.css'
import store from './app/store'
import App from './app/App'

const container = document.getElementById('app-root')!
const root = ReactDOM.createRoot(container)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
