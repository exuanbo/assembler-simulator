import 'virtual:windi.css'
import './styles.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import App from './app/App'

const container = document.getElementById('app-root')!
const root = ReactDOM.createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
