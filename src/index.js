import { App } from './App'
import { EventEmitter } from 'events'

import config from './configs/config'

document.addEventListener('DOMContentLoaded', () => {
  window.eventBus = new EventEmitter()

  window.app = new App()
  window.app.init(config, window.eventBus)
})

window.addEventListener('beforeunload', (e) => {
  window.app.disconnect()
    .then(e => {
    })
}, false)
