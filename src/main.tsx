import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import './styles.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import App from './app/App'

const appContainer = document.getElementById('app-root')!
const root = ReactDOM.createRoot(appContainer)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
