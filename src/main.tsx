import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import * as ReactRedux from 'react-redux'
import 'virtual:windi.css'
import './styles.css'
import store from './app/store'
import App from './app/App'

const container = document.getElementById('app-root')!
const root = ReactDOM.createRoot(container)

root.render(
  <React.StrictMode>
    <ReactRedux.Provider store={store}>
      <App />
    </ReactRedux.Provider>
  </React.StrictMode>
)
