import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import { store } from './app/store'
import { fetchUsers } from './features/users/usersSlice'

import './index.css'

import { worker } from './api/server'
import { fetchPosts } from './features/posts/postsSlice'
import { fetchNotifications } from './features/notifications/notificationsSlice'
import { apiSlice } from './features/api/apiSlice'

// Wrap app rendering so we can wait for the mock API to initialize
async function start() {
  // Start our mock API server
  await worker.start({ onUnhandledRequest: 'bypass' })
  
  store.dispatch(apiSlice.endpoints.getUsers.initiate())//store.dispatch(fetchUsers())  

  const root = createRoot(document.getElementById('root'))

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
}

start()
